import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import { usePacienteSearch } from './usePacienteSearch';
import type { CentroSalud, Profesional, User } from '@/types';

import { CONVENIOS_POPULARES, extractSlotHHmm } from '../utils/mostradorConstants';
export { CONVENIOS_POPULARES };

export function useNuevoTurnoMostrador() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const scopedCentroId = user?.centroSaludId ? String(user.centroSaludId) : '';
  const initialDni = (searchParams.get('dni') || '').replace(/\D/g, '');
  const hoy = new Date().toLocaleDateString('en-CA');

  const [centro, setCentro] = useState<CentroSalud | null>(null);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('TODAS');

  const [obraSocial, setObraSocial] = useState('Particular / Sin Obra Social');
  const [otraObraSocial, setOtraObraSocial] = useState('');
  const [copagoMonto, setCopagoMonto] = useState('0');
  const [numeroBono, setNumeroBono] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('Consulta presencial de mostrador');

  const handlePatientSelect = useCallback((p: User) => {
    if (p.obraSocial) {
      if (CONVENIOS_POPULARES.includes(p.obraSocial)) {
        setObraSocial(p.obraSocial);
      } else {
        setObraSocial('Otra');
        setOtraObraSocial(p.obraSocial);
      }
    }
  }, []);

  const patientSearch = usePacienteSearch(initialDni, handlePatientSelect);

  const [profesionalId, setProfesionalId] = useState('');
  const [consultorioNumero, setConsultorioNumero] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState('');
  const [horaManual, setHoraManual] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [loadingContext, setLoadingContext] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadCenterContext = async () => {
      setLoadingContext(true);
      try {
        const [centroData, profsData, consData] = await Promise.all([
          scopedCentroId ? centrosService.getById(scopedCentroId) : Promise.resolve(undefined),
          scopedCentroId
            ? profesionalesService.getByCentro(scopedCentroId).catch(() => [] as Profesional[])
            : profesionalesService.getAll().catch(() => [] as Profesional[]),
          scopedCentroId
            ? centrosService.getConsultorios(scopedCentroId).catch(() => [] as ConsultorioItem[])
            : Promise.resolve([] as ConsultorioItem[]),
        ]);

        if (!active) return;
        const activeProfs = profsData.filter((p) => p.activo !== false);
        const activeCons = consData.filter((c) => c.activo !== false);

        setCentro(centroData ?? null);
        setProfesionales(activeProfs);
        setConsultorios(activeCons);

        if (activeProfs[0]) setProfesionalId(activeProfs[0].id);
        if (activeCons[0]) setConsultorioNumero(activeCons[0].numero);
      } finally {
        if (active) setLoadingContext(false);
      }
    };

    void loadCenterContext();
    return () => {
      active = false;
    };
  }, [scopedCentroId]);

  const especialidades = useMemo(() => {
    const set = new Set<string>();
    profesionales.forEach((p) => {
      if (p.especialidadNombre) set.add(p.especialidadNombre);
    });
    return Array.from(set).sort();
  }, [profesionales]);

  const profesionalesFiltrados = useMemo(() => {
    if (filtroEspecialidad === 'TODAS') return profesionales;
    return profesionales.filter((p) => p.especialidadNombre === filtroEspecialidad);
  }, [profesionales, filtroEspecialidad]);

  const handleCambiarEspecialidad = useCallback((esp: string) => {
    setFiltroEspecialidad(esp);
    const validos = esp === 'TODAS' ? profesionales : profesionales.filter((p) => p.especialidadNombre === esp);
    if (validos.length > 0 && !validos.some((p) => p.id === profesionalId)) {
      setProfesionalId(validos[0]?.id ?? '');
    }
  }, [profesionales, profesionalId]);

  useEffect(() => {
    let cancelled = false;
    if (!profesionalId || !fecha) {
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const raw = await turnosService.getDisponibles(profesionalId, fecha);
        if (cancelled) return;
        const normalized = Array.from(new Set(raw.map(extractSlotHHmm).filter(Boolean)));
        setSlotsDisponibles(normalized);
        setHora((prev) => (normalized.includes(prev) ? prev : normalized[0] ?? ''));
      } catch {
        if (!cancelled) {
          setSlotsDisponibles([]);
          setHora('');
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    void fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [profesionalId, fecha]);

  const handleSubmit = async (): Promise<boolean> => {
    if (!scopedCentroId) {
      setSubmitError('Tu usuario no tiene un centro de salud asignado.');
      return false;
    }
    if (!patientSearch.paciente) {
      setSubmitError('Buscá y seleccioná un paciente empadronado antes de confirmar.');
      return false;
    }
    const prof = profesionales.find((p) => p.id === profesionalId);
    if (!prof) {
      setSubmitError('Seleccioná un profesional médico del centro.');
      return false;
    }
    const effectiveHora = (hora || horaManual).trim();
    if (!/^\d{2}:\d{2}$/.test(effectiveHora)) {
      setSubmitError('Seleccioná o ingresá un horario válido (HH:mm).');
      return false;
    }

    const consObj = consultorios.find((c) => c.numero === consultorioNumero);
    const resolvedObraSocial = obraSocial === 'Otra' ? (otraObraSocial.trim() || 'Particular') : obraSocial;

    setSaving(true);
    setSubmitError(null);
    try {
      const nuevo = await turnosService.crearTurnoMostrador({
        fecha,
        hora: effectiveHora,
        pacienteId: patientSearch.paciente.id,
        pacienteNombre: `${patientSearch.paciente.nombre} ${patientSearch.paciente.apellido}`.trim(),
        pacienteDni: patientSearch.paciente.dni,
        pacienteTelefono: patientSearch.paciente.telefono || 'Sin especificar',
        obraSocial: resolvedObraSocial,
        copagoMonto: Number(copagoMonto) || 0,
        numeroBono: numeroBono.trim() || undefined,
        esPrimeraVez: false,
        consultorioNumero: consObj?.numero || consultorioNumero || '',
        planta: consObj?.planta || (consultorios.length === 0 ? 'Sin consultorio asignado' : 'Planta Baja'),
        profesionalId: prof.id,
        profesionalNombre: `${prof.nombre} ${prof.apellido}`.trim(),
        especialidadNombre: prof.especialidadNombre,
        centroSaludId: scopedCentroId,
        centroSaludNombre: centro?.nombre ?? user?.centroSaludNombre ?? 'Centro Asignado',
        estado: 'CONFIRMADO',
        motivoConsulta: motivoConsulta.trim() || 'Consulta presencial de mostrador',
      });
      success(`Turno de mostrador confirmado para ${nuevo.pacienteNombre} (${nuevo.hora} hs).`);
      navigate('/dashboard/recepcion');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo generar el turno de mostrador.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    centroNombre: centro?.nombre ?? user?.centroSaludNombre ?? 'Sede Actual',
    hoy,
    profesionales: profesionalesFiltrados,
    consultorios,
    especialidades,
    filtroEspecialidad,
    setFiltroEspecialidad: handleCambiarEspecialidad,
    patientSearch,
    profesionalId,
    setProfesionalId,
    consultorioNumero,
    setConsultorioNumero,
    fecha,
    setFecha,
    hora,
    setHora,
    horaManual,
    setHoraManual,
    slotsDisponibles,
    loadingSlots,
    obraSocial,
    setObraSocial,
    otraObraSocial,
    setOtraObraSocial,
    copagoMonto,
    setCopagoMonto,
    numeroBono,
    setNumeroBono,
    motivoConsulta,
    setMotivoConsulta,
    loadingContext,
    saving,
    submitError,
    handleSubmit,
  };
}
