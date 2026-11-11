import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { centrosService } from '@/api/centrosService';
import type { CentroSalud } from '@/types';
import {
  INITIAL_SEDE_VALUES,
  type SedeFormErrors,
  type SedeFormValues,
  toSedeFormValues,
  validateAllSedeFields,
  validateSedeField,
} from '../utils/sedeFormHelpers';

export type { SedeFormErrors, SedeFormValues };

/**
 * Encapsulates loading, validation and update submission for the active medical center profile.
 */
export function useEditarSede() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const centroId = String(user?.centroSaludId ?? '').trim();

  const [centro, setCentro] = useState<CentroSalud | null>(null);
  const [values, setValues] = useState<SedeFormValues>(INITIAL_SEDE_VALUES);
  const [errors, setErrors] = useState<SedeFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCentro = useCallback(async () => {
    if (!centroId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await centrosService.getById(centroId);
      if (data) {
        setCentro(data);
        setValues(toSedeFormValues(data));
      } else {
        setSubmitError('No se encontró la sede asignada a tu cuenta.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo cargar la sede.');
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    void loadCentro();
  }, [loadCentro]);

  const clearFieldError = (field: keyof SedeFormValues) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setField = <K extends keyof SedeFormValues>(field: K, value: SedeFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
    if (field === 'permiteEstudios') clearFieldError('estudiosDisponibles');
    if (submitError) setSubmitError(null);
  };

  const setCoordinates = useCallback((lat: number, lng: number) => {
    setValues((prev) => ({ ...prev, latitud: String(lat), longitud: String(lng) }));
    setErrors((prev) => {
      if (!prev.latitud && !prev.longitud) return prev;
      const next = { ...prev };
      delete next.latitud;
      delete next.longitud;
      return next;
    });
    setSubmitError(null);
  }, []);

  const toggleEstudio = useCallback((estudio: string) => {
    setValues((prev) => {
      const exists = prev.estudiosDisponibles.includes(estudio);
      const estudiosDisponibles = exists
        ? prev.estudiosDisponibles.filter((item) => item !== estudio)
        : [...prev.estudiosDisponibles, estudio];
      return { ...prev, estudiosDisponibles };
    });
    clearFieldError('estudiosDisponibles');
    setSubmitError(null);
  }, []);

  const handleBlur = (field: keyof SedeFormValues) => {
    const raw = values[field];
    if (typeof raw !== 'string') return;
    const errorMsg = validateSedeField(field, raw);
    setErrors((prev) => {
      if (!errorMsg) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: errorMsg };
    });
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!centroId) {
      setSubmitError('Tu usuario no tiene una sede asignada.');
      return false;
    }
    const nextErrors = validateAllSedeFields(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const latNum = values.latitud.trim() ? Number(values.latitud.trim()) : undefined;
      const lngNum = values.longitud.trim() ? Number(values.longitud.trim()) : undefined;
      const cantidadPlantas = Number(values.cantidadPlantas.trim()) || 1;

      await centrosService.updateCentro(centroId, {
        nombre: values.nombre.trim(),
        tipo: values.tipo,
        direccion: values.direccion.trim(),
        ciudad: values.ciudad.trim(),
        telefono: values.telefono.trim(),
        horarioAtencion: values.horarioAtencion.trim(),
        cantidadPlantas,
        disponibleGuardia: values.disponibleGuardia,
        permiteConsultas: values.permiteConsultas,
        permiteEstudios: values.permiteEstudios,
        estudiosDisponibles: values.permiteEstudios ? values.estudiosDisponibles : [],
        latitud: latNum,
        longitud: lngNum,
      });
      success('Información institucional de la sede actualizada.');
      navigate('/dashboard/recepcion/sede');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron guardar los cambios.';
      setSubmitError(message);
      toastError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    centro,
    values,
    errors,
    submitError,
    loading,
    saving,
    setField,
    setCoordinates,
    toggleEstudio,
    handleBlur,
    handleSubmit,
  };
}
