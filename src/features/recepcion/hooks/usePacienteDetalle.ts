import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { pacientesService } from '@/api/pacientesService';
import { turnosService } from '@/api/turnosService';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '@/lib/dniValidation';
import { CONVENIOS_POPULARES } from '@/features/recepcion/utils/mostradorConstants';
import type { Turno, User, Familiar, FamiliarRequest, PacienteFormValues, PacienteFormErrors } from '@/types';

export type { PacienteFormValues, PacienteFormErrors };

function mapPacienteToFormValues(pac: User): PacienteFormValues {
  const os = pac.obraSocial ?? 'Particular / Sin Obra Social';
  const esPopular = CONVENIOS_POPULARES.includes(os);
  return {
    nombre: pac.nombre ?? '',
    apellido: pac.apellido ?? '',
    dni: pac.dni ?? '',
    telefono: pac.telefono ?? '',
    email: pac.email ?? '',
    obraSocial: esPopular ? os : 'Otra',
    otraObraSocial: esPopular ? '' : os,
    nroAfiliado: pac.nroAfiliado ?? '',
    grupoSanguineo: pac.grupoSanguineo ?? '',
    fechaNacimiento: pac.fechaNacimiento ?? '',
    activo: pac.activo !== false,
  };
}

export function usePacienteDetalle(pacienteId?: string) {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const canEdit = currentUser?.rol === 'RECEPCIONISTA' || currentUser?.rol === 'ADMIN';

  const [paciente, setPaciente] = useState<User | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [values, setValues] = useState<PacienteFormValues>({
    nombre: '', apellido: '', dni: '', telefono: '', email: '',
    obraSocial: CONVENIOS_POPULARES[0], otraObraSocial: '',
    nroAfiliado: '', grupoSanguineo: '', fechaNacimiento: '', activo: true,
  });
  const [errors, setErrors] = useState<PacienteFormErrors>({});
  const [loading, setLoading] = useState(Boolean(pacienteId));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(pacienteId ? null : 'Identificador de paciente inválido.');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPacienteData = useCallback(async (id: string | number) => {
    const [pac, history, fams] = await Promise.all([
      pacientesService.getById(id),
      turnosService.getByPaciente(id).catch(() => [] as Turno[]),
      pacientesService.getFamiliares(id).catch(() => [] as Familiar[]),
    ]);
    return { pac, history, fams };
  }, []);

  const applyLoadedData = useCallback((pac: User, history: Turno[], fams: Familiar[]) => {
    setPaciente(pac);
    setTurnos(Array.isArray(history) ? history : []);
    setFamiliares(Array.isArray(fams) ? fams : []);
    setValues(mapPacienteToFormValues(pac));
  }, []);

  const loadData = useCallback(async () => {
    if (!pacienteId) {
      setLoading(false);
      setLoadError('Identificador de paciente inválido.');
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const { pac, history, fams } = await fetchPacienteData(pacienteId);
      if (!pac) {
        setPaciente(null);
        setLoadError('No se encontró la ficha del paciente solicitado.');
        return;
      }
      applyLoadedData(pac, history, fams);
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la ficha del paciente.'));
    } finally {
      setLoading(false);
    }
  }, [pacienteId, fetchPacienteData, applyLoadedData]);

  useEffect(() => {
    if (!pacienteId) return;
    let isSubscribed = true;

    fetchPacienteData(pacienteId)
      .then(({ pac, history, fams }) => {
        if (!isSubscribed) return;
        if (!pac) {
          setPaciente(null);
          setLoadError('No se encontró la ficha del paciente solicitado.');
          return;
        }
        applyLoadedData(pac, history, fams);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la ficha del paciente.'));
      })
      .finally(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [pacienteId, fetchPacienteData, applyLoadedData]);

  const setField = <K extends keyof PacienteFormValues>(field: K, value: PacienteFormValues[K]) => {
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
    if (values.nombre.trim().length < 2) next.nombre = 'Ingresá el nombre del paciente.';
    if (values.apellido.trim().length < 2) next.apellido = 'Ingresá el apellido del paciente.';
    if (!isValidDniFormat(values.dni.trim())) next.dni = DNI_VALIDATION_ERROR;
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
      const osFinal = values.obraSocial === 'Otra' ? (values.otraObraSocial.trim() || 'Particular') : values.obraSocial;
      const updated = await pacientesService.actualizarCompleto(paciente.id, {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        dni: values.dni.trim(),
        telefono: values.telefono.trim() || undefined,
        email: values.email.trim() || undefined,
        obraSocial: osFinal,
        nroAfiliado: values.nroAfiliado.trim() || undefined,
        grupoSanguineo: values.grupoSanguineo.trim() || undefined,
        fechaNacimiento: values.fechaNacimiento.trim() || undefined,
        activo: values.activo,
      });
      setPaciente((prev) => (prev ? { ...prev, ...updated } : updated));
      success('Ficha administrativa del paciente actualizada correctamente.');
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

  const handleAgregarFamiliar = async (req: FamiliarRequest): Promise<boolean> => {
    if (!paciente) return false;
    try {
      const nuevo = await pacientesService.vincularFamiliar(paciente.id, req);
      setFamiliares((prev) => [...prev, nuevo]);
      success(`Familiar ${nuevo.nombre} ${nuevo.apellido} vinculado con éxito.`);
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo vincular el familiar.'));
      return false;
    }
  };

  const handleEliminarFamiliar = async (vinculoId: string | number): Promise<boolean> => {
    if (!paciente) return false;
    try {
      await pacientesService.desvincularFamiliar(paciente.id, vinculoId);
      setFamiliares((prev) => prev.filter((f) => String(f.id) !== String(vinculoId)));
      success('Familiar desvinculado.');
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo desvincular el familiar.'));
      return false;
    }
  };

  const handleMarcarAusente = async (t: Turno) => {
    try {
      const updated = await turnosService.marcarAusente(t.id);
      if (updated) {
        setTurnos((prev) => prev.map((item) => (item.id === t.id ? updated : item)));
        success('Turno marcado como Ausente.');
      }
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo marcar ausente.'));
    }
  };

  const handleTurnoCancelado = (id: string) => {
    setTurnos((prev) => prev.map((item) => (String(item.id) === String(id) ? { ...item, estado: 'CANCELADO' } : item)));
    success('Turno cancelado exitosamente.');
  };

  return {
    canEdit,
    paciente,
    turnos,
    familiares,
    values,
    errors,
    loading,
    saving,
    loadError,
    submitError,
    conveniosPopulares: CONVENIOS_POPULARES,
    setField,
    loadData,
    handleSave,
    handleAgregarFamiliar,
    handleEliminarFamiliar,
    handleMarcarAusente,
    handleTurnoCancelado,
  };
}
