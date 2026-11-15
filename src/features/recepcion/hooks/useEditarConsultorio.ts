import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { buildFloorOptions } from '@/lib/centroUtils';
import type { Especialidad } from '@/types';
import type { ConsultorioFormErrors, ConsultorioFormValues } from '../components/ConsultorioFormFields';

/**
 * Encapsulates loading, floor resolution, duplicate check, and update persistence for an existing consulting room.
 */
export function useEditarConsultorio() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const centroId = String(user?.centroSaludId ?? '').trim();

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [existingConsultorios, setExistingConsultorios] = useState<ConsultorioItem[]>([]);
  const [cantidadPlantas, setCantidadPlantas] = useState<number>(1);
  const [initialPlanta, setInitialPlanta] = useState<string>('Planta Baja');
  const [values, setValues] = useState<ConsultorioFormValues>({
    numero: '',
    planta: 'Planta Baja',
    especialidadAsignada: '',
    activo: true,
  });
  const [errors, setErrors] = useState<ConsultorioFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const floorOptions = useMemo(
    () => buildFloorOptions(cantidadPlantas, initialPlanta),
    [cantidadPlantas, initialPlanta]
  );

  const loadContext = useCallback(async () => {
    if (!id) {
      setNotFoundError('Identificador de consultorio inválido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFoundError(null);
    try {
      const targetCentroId = centroId || undefined;
      const [consultorio, specs, consultorios, centro] = await Promise.all([
        centrosService.getConsultorioById(id),
        profesionalesService.getEspecialidades().catch(() => [] as Especialidad[]),
        targetCentroId
          ? centrosService.getConsultorios(targetCentroId).catch(() => [] as ConsultorioItem[])
          : Promise.resolve([] as ConsultorioItem[]),
        targetCentroId
          ? centrosService.getById(targetCentroId).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);
      setEspecialidades(specs);
      setExistingConsultorios(consultorios);
      setCantidadPlantas(centro?.cantidadPlantas && centro.cantidadPlantas >= 1 ? centro.cantidadPlantas : 1);
      setInitialPlanta(consultorio.planta || 'Planta Baja');
      setValues({
        numero: consultorio.numero,
        planta: consultorio.planta || 'Planta Baja',
        especialidadAsignada: consultorio.especialidadAsignada || '',
        activo: consultorio.activo !== false,
      });
    } catch (err) {
      setNotFoundError(err instanceof Error ? err.message : 'No se pudo cargar el consultorio.');
    } finally {
      setLoading(false);
    }
  }, [centroId, id]);

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
      (c) => c.id !== id && (c?.numero ?? '').trim().toLowerCase() === clean.toLowerCase()
    );
    if (duplicated) {
      return `Ya existe otro consultorio "${clean}" en esta sede.`;
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
    const numeroError = validateNumero(values.numero);
    if (numeroError) {
      setErrors({ numero: numeroError });
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await centrosService.updateConsultorio(id, {
        numero: values.numero.trim(),
        planta: values.planta,
        especialidadAsignada: values.especialidadAsignada.trim() || undefined,
        activo: values.activo,
      });
      success(`Consultorio "${values.numero.trim()}" actualizado correctamente.`);
      navigate('/dashboard/recepcion/sede');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el consultorio.';
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
    notFoundError,
    loading,
    saving,
    setField,
    handleBlurNumero,
    handleSubmit,
  };
}
