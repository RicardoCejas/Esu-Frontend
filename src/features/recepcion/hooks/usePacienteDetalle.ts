import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { pacientesService } from '@/api/pacientesService';
import { turnosService } from '@/api/turnosService';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '@/lib/dniValidation';
import type { Turno, User } from '@/types';

export interface PacienteFormValues {
  dni: string;
  telefono: string;
  email: string;
  obraSocial: string;
  nroAfiliado: string;
  grupoSanguineo: string;
  fechaNacimiento: string;
}

export type PacienteFormErrors = Partial<Record<keyof PacienteFormValues, string>>;

/**
 * Coordinates loading patient demographic/coverage profile and appointment history,
 * plus contact/coverage editing for authorized receptionists.
 */
export function usePacienteDetalle(pacienteId?: string) {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const canEdit =
    currentUser?.rol === 'RECEPCIONISTA' || currentUser?.rol === 'ADMIN';

  const [paciente, setPaciente] = useState<User | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [values, setValues] = useState<PacienteFormValues>({
    dni: '',
    telefono: '',
    email: '',
    obraSocial: '',
    nroAfiliado: '',
    grupoSanguineo: '',
    fechaNacimiento: '',
  });
  const [errors, setErrors] = useState<PacienteFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!pacienteId) {
      setLoading(false);
      setLoadError('Identificador de paciente inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [pac, history] = await Promise.all([
        pacientesService.getById(pacienteId),
        turnosService.getByPaciente(pacienteId).catch(() => [] as Turno[]),
      ]);

      if (!pac) {
        setPaciente(null);
        setLoadError('No se encontró la ficha del paciente solicitado.');
        return;
      }

      setPaciente(pac);
      setTurnos(Array.isArray(history) ? history : []);
      setValues({
        dni: pac.dni ?? '',
        telefono: pac.telefono ?? '',
        email: pac.email ?? '',
        obraSocial: pac.obraSocial ?? '',
        nroAfiliado: pac.nroAfiliado ?? '',
        grupoSanguineo: pac.grupoSanguineo ?? '',
        fechaNacimiento: pac.fechaNacimiento ?? '',
      });
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la ficha del paciente.'));
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const setField = <K extends keyof PacienteFormValues>(field: K, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError(null);
  };

  const validate = (): PacienteFormErrors => {
    const next: PacienteFormErrors = {};
    const dniClean = values.dni.trim();
    if (!isValidDniFormat(dniClean)) {
      next.dni = DNI_VALIDATION_ERROR;
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'El correo electrónico ingresado no tiene un formato válido.';
    }
    return next;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!paciente || !canEdit) return false;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await pacientesService.updateContacto(paciente.id, {
        dni: values.dni.trim(),
        telefono: values.telefono.trim() || undefined,
        email: values.email.trim() || undefined,
        obraSocial: values.obraSocial.trim() || undefined,
        nroAfiliado: values.nroAfiliado.trim() || undefined,
        grupoSanguineo: values.grupoSanguineo.trim() || undefined,
        fechaNacimiento: values.fechaNacimiento.trim() || undefined,
      });
      setPaciente((prev) => (prev ? { ...prev, ...updated } : updated));
      success('Datos de contacto y cobertura actualizados.');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo actualizar la ficha del paciente.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    canEdit,
    paciente,
    turnos,
    values,
    errors,
    loading,
    saving,
    loadError,
    submitError,
    setField,
    loadData,
    handleSave,
  };
}
