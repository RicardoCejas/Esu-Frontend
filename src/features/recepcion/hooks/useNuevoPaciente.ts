import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { pacientesService } from '@/api/pacientesService';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '@/lib/dniValidation';

export interface NuevoPacienteValues {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  altaRapidaSinEmail: boolean;
  obraSocial: string;
  nroAfiliado: string;
  fechaNacimiento: string;
  grupoSanguineo: string;
}

export type NuevoPacienteErrors = Partial<Record<keyof NuevoPacienteValues, string>>;

/**
 * Unifies full reception onboarding and walk-in quick patient intake into a single resilient flow.
 */
export function useNuevoPaciente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const returnTo = searchParams.get('returnTo') || '';
  const initialDni = (searchParams.get('dni') || '').replace(/\D/g, '');
  const isQuickModeDefault = returnTo === 'turno' || returnTo === 'sobreturno';

  const [values, setValues] = useState<NuevoPacienteValues>({
    nombre: '',
    apellido: '',
    dni: initialDni,
    telefono: '',
    email: '',
    altaRapidaSinEmail: isQuickModeDefault,
    obraSocial: 'Particular / Sin Obra Social',
    nroAfiliado: '',
    fechaNacimiento: '',
    grupoSanguineo: '',
  });
  const [errors, setErrors] = useState<NuevoPacienteErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof NuevoPacienteValues>(
    field: K,
    value: NuevoPacienteValues[K]
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

  const validate = (): NuevoPacienteErrors => {
    const next: NuevoPacienteErrors = {};
    if (values.nombre.trim().length < 2) next.nombre = 'Ingresá el nombre del paciente.';
    if (values.apellido.trim().length < 2) next.apellido = 'Ingresá el apellido del paciente.';
    const dniClean = values.dni.trim();
    if (!isValidDniFormat(dniClean)) {
      next.dni = DNI_VALIDATION_ERROR;
    }
    if (values.altaRapidaSinEmail && values.telefono.trim().length < 6) {
      next.telefono = 'Para alta rápida sin correo, el teléfono es obligatorio.';
    }
    const emailClean = values.email.trim();
    if (!values.altaRapidaSinEmail && emailClean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      next.email = 'El formato del correo electrónico no es válido.';
    }
    return next;
  };

  const handleSubmit = async (): Promise<boolean> => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const dniClean = values.dni.trim();
      const resolvedEmail = values.altaRapidaSinEmail
        ? `dni${dniClean}@recepcion.esu.salud`
        : values.email.trim() || `dni${dniClean}@recepcion.esu.salud`;

      const creado = await pacientesService.createPaciente({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        dni: dniClean,
        telefono: values.telefono.trim() || undefined,
        email: resolvedEmail,
        obraSocial: values.obraSocial || undefined,
        nroAfiliado: values.nroAfiliado.trim() || undefined,
        fechaNacimiento: values.fechaNacimiento.trim() || undefined,
        grupoSanguineo: values.grupoSanguineo || undefined,
        centroSaludId: user?.centroSaludId ? String(user.centroSaludId) : undefined,
      });

      success(`Paciente ${creado.nombre} ${creado.apellido} empadronado correctamente.`);

      if (returnTo === 'turno') {
        navigate(`/dashboard/recepcion/turnos/nuevo?dni=${encodeURIComponent(creado.dni)}`);
      } else if (returnTo === 'sobreturno') {
        navigate(`/dashboard/recepcion/kanban/sobreturno?dni=${encodeURIComponent(creado.dni)}`);
      } else {
        navigate(`/dashboard/recepcion/pacientes/${creado.id}`);
      }
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo registrar el paciente en el padrón.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    returnTo,
    values,
    errors,
    submitError,
    saving,
    setField,
    handleSubmit,
  };
}
