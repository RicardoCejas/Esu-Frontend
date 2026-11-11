import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { buildFloorOptions } from '@/lib/centroUtils';
import type { Especialidad } from '@/types';
import type { ConsultorioFormErrors, ConsultorioFormValues } from '../components/ConsultorioFormFields';

/**
 * Encapsulates specialty lookup, floor configuration, duplicate validation, and creation for a consulting room.
 */
export function useNuevoConsultorio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const centroId = String(user?.centroSaludId ?? '').trim();

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [existingConsultorios, setExistingConsultorios] = useState<ConsultorioItem[]>([]);
  const [cantidadPlantas, setCantidadPlantas] = useState<number>(1);
  const [values, setValues] = useState<ConsultorioFormValues>({
    numero: '',
    planta: 'Planta Baja',
    especialidadAsignada: '',
    activo: true,
  });
  const [errors, setErrors] = useState<ConsultorioFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const floorOptions = useMemo(() => buildFloorOptions(cantidadPlantas), [cantidadPlantas]);

  const loadContext = useCallback(async () => {
    setLoading(true);
    try {
      const [specs, consultorios, centro] = await Promise.all([
        profesionalesService.getEspecialidades().catch(() => [] as Especialidad[]),
        centroId
          ? centrosService.getConsultorios(centroId).catch(() => [] as ConsultorioItem[])
          : Promise.resolve([] as ConsultorioItem[]),
        centroId
          ? centrosService.getById(centroId).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);
      setEspecialidades(specs);
      setExistingConsultorios(consultorios);
      setCantidadPlantas(centro?.cantidadPlantas && centro.cantidadPlantas >= 1 ? centro.cantidadPlantas : 1);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const setField = <K extends keyof ConsultorioFormValues>(
    field: K,
    value: ConsultorioFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError(null);
  };

  const validateNumero = (raw: string): string | undefined => {
    const clean = raw.trim();
    if (!clean) {
      return 'Ingresá el número o código identificador del consultorio.';
    }
    const duplicated = existingConsultorios.some(
      (c) => (c?.numero ?? '').trim().toLowerCase() === clean.toLowerCase()
    );
    if (duplicated) {
      return `Ya existe el consultorio "${clean}" en esta sede.`;
    }
    return undefined;
  };

  const handleBlurNumero = () => {
    const err = validateNumero(values.numero);
    setErrors((prev) => {
      if (!err) {
        if (!prev.numero) return prev;
        const next = { ...prev };
        delete next.numero;
        return next;
      }
      return { ...prev, numero: err };
    });
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!centroId) {
      setSubmitError('Tu cuenta no tiene una sede asignada.');
      return false;
    }

    const numeroError = validateNumero(values.numero);
    if (numeroError) {
      setErrors({ numero: numeroError });
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await centrosService.createConsultorio({
        centroSaludId: centroId,
        numero: values.numero.trim(),
        planta: values.planta,
        especialidadAsignada: values.especialidadAsignada.trim() || undefined,
        activo: values.activo,
      });
      success(`Consultorio "${values.numero.trim()}" creado correctamente.`);
      navigate('/dashboard/recepcion/sede');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el consultorio.';
      setSubmitError(message);
      toastError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    especialidades,
    existingConsultorios,
    floorOptions,
    values,
    errors,
    submitError,
    loading,
    saving,
    setField,
    handleBlurNumero,
    handleSubmit,
  };
}
