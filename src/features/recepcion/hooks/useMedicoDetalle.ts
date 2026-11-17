import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type {
  BloqueoAgenda,
  CentroSalud,
  DisponibilidadProfesional,
  Especialidad,
  Profesional,
  Turno,
} from '@/types';

export interface MedicoFormValues {
  nombre: string;
  apellido: string;
  matricula: string;
  telefono: string;
  especialidadId: string;
}

export type MedicoFormErrors = Partial<Record<keyof MedicoFormValues, string>>;

const INITIAL_VALUES: MedicoFormValues = {
  nombre: '',
  apellido: '',
  matricula: '',
  telefono: '',
  especialidadId: '',
};

/**
 * Coordinates doctor profile loading, editable administrative fields,
 * center memberships, and read-only availability/blockers for reception staff.
 */
export function useMedicoDetalle(medicoId?: string) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const activeCentroId = String(user?.centroSaludId ?? '').trim();

  const [medico, setMedico] = useState<Profesional | null>(null);
  const [values, setValues] = useState<MedicoFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<MedicoFormErrors>({});
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadProfesional[]>([]);
  const [bloqueos, setBloqueos] = useState<BloqueoAgenda[]>([]);
  const [proximosTurnos, setProximosTurnos] = useState<Turno[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!medicoId) {
      setLoading(false);
      setLoadError('Identificador de profesional inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [prof, specs, allCentros, dispList, blockList, turnosList] = await Promise.all([
        profesionalesService.getById(medicoId),
        profesionalesService.getEspecialidades().catch(() => [] as Especialidad[]),
        centrosService.getAll().catch(() => [] as CentroSalud[]),
        profesionalesService.getDisponibilidad(medicoId).catch(() => [] as DisponibilidadProfesional[]),
        profesionalesService.getBloqueos(medicoId).catch(() => [] as BloqueoAgenda[]),
        turnosService
          .getByProfesional(medicoId, activeCentroId ? { centroSaludId: activeCentroId } : undefined)
          .catch(() => [] as Turno[]),
      ]);

      if (!prof) {
        setMedico(null);
        setLoadError('No se encontró la ficha del profesional solicitado.');
        return;
      }

      setMedico(prof);
      setValues({
        nombre: prof.nombre ?? '',
        apellido: prof.apellido ?? '',
        matricula: prof.matricula ?? '',
        telefono: prof.telefono ?? '',
        especialidadId: prof.especialidadId ?? '',
      });
      setEspecialidades(specs);
      setCentros(allCentros);
      setDisponibilidades(dispList);
      setBloqueos(blockList);
      setProximosTurnos(
        turnosList.filter((t) => t.estado !== 'CANCELADO').slice(0, 8)
      );
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la ficha del profesional.'));
    } finally {
      setLoading(false);
    }
  }, [medicoId, activeCentroId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const setField = <K extends keyof MedicoFormValues>(field: K, value: MedicoFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError(null);
  };

  const validate = (): MedicoFormErrors => {
    const next: MedicoFormErrors = {};
    if (values.nombre.trim().length < 2) next.nombre = 'Ingresá el nombre del profesional.';
    if (values.apellido.trim().length < 2) next.apellido = 'Ingresá el apellido del profesional.';
    if (values.matricula.trim().length < 3) next.matricula = 'Ingresá la matrícula profesional.';
    if (!values.especialidadId) next.especialidadId = 'Seleccioná una especialidad.';
    return next;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!medico) return false;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await profesionalesService.updateProfesional(medico.id, {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        matricula: values.matricula.trim(),
        telefono: values.telefono.trim(),
        especialidadId: values.especialidadId,
      });
      setMedico((prev) => ({ ...prev, ...updated }));
      success(`Ficha de ${updated.nombre} ${updated.apellido} actualizada.`);
      return true;
    } catch (err) {
      const message = extractApiErrorMessage(err, 'No se pudo actualizar la ficha del médico.');
      setSubmitError(message);
      toastError(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (): Promise<boolean> => {
    if (!medico) return false;
    const nextState = medico.activo === false;
    setSaving(true);
    try {
      const updated = await profesionalesService.cambiarEstado(medico.id, nextState);
      setMedico((prev) => (prev ? { ...prev, activo: updated.activo ?? nextState } : prev));
      success(
        nextState
          ? 'Profesional reactivado para asignación de turnos.'
          : 'Profesional pasado a estado inactivo.'
      );
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo cambiar el estado del profesional.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleVincularCentro = async (centroId: string): Promise<boolean> => {
    if (!medico || !centroId) return false;
    setSaving(true);
    try {
      await profesionalesService.vincularCentro(medico.id, centroId);
      success('Profesional vinculado a la sede correctamente.');
      await loadData();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo vincular el profesional a la sede.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDesvincularCentro = async (centroId: string): Promise<boolean> => {
    if (!medico || !centroId) return false;
    setSaving(true);
    try {
      await profesionalesService.desvincularCentro(medico.id, centroId);
      success('Profesional desvinculado de la sede.');
      await loadData();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo desvincular el profesional de la sede.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    activeCentroId,
    medico,
    values,
    errors,
    especialidades,
    centros,
    disponibilidades,
    bloqueos,
    proximosTurnos,
    loading,
    saving,
    loadError,
    submitError,
    setField,
    loadData,
    handleSave,
    handleToggleEstado,
    handleVincularCentro,
    handleDesvincularCentro,
  };
}
