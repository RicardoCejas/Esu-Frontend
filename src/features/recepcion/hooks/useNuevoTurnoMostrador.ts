import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { pacientesService } from '@/api/pacientesService';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import type { CentroSalud, Profesional, User } from '@/types';

const extractSlotHHmm = (raw: string): string => {
  const clean = String(raw ?? '').trim();
  return clean.includes('T') ? (clean.split('T')[1]?.slice(0, 5) ?? clean.slice(0, 5)) : clean.slice(0, 5);
};

/**
 * Coordinates counter walk-in/same-day appointment creation scoped to the receptionist's center,
 * fetching real center doctors, rooms, and available slots.
 */
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

  const [dniBusqueda, setDniBusqueda] = useState(initialDni);
  const [paciente, setPaciente] = useState<User | null>(null);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);

  const [profesionalId, setProfesionalId] = useState('');
  const [consultorioNumero, setConsultorioNumero] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState('');
  const [horaManual, setHoraManual] = useState('');
  const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [obraSocial, setObraSocial] = useState('Particular / Sin Obra Social');
  const [copagoMonto, setCopagoMonto] = useState('0');
  const [numeroBono, setNumeroBono] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('Consulta presencial de mostrador');

  const [loadingContext, setLoadingContext] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buscarPorDni = useCallback(async (rawDni?: string) => {
    const clean = (rawDni ?? dniBusqueda).replace(/\D/g, '');
    if (clean.length < 7) {
      setDniError('Ingresá al menos 7 dígitos del DNI para buscar en el padrón.');
      setPaciente(null);
      return;
    }

    setBuscandoDni(true);
    setDniError(null);
    try {
      const found = await pacientesService.getByDni(clean);
      if (found) {
        setPaciente(found);
        setObraSocial(found.obraSocial || 'Particular / Sin Obra Social');
      } else {
        setPaciente(null);
        setDniError(`No encontramos ningún paciente con DNI ${clean}. Podés darlo de alta ahora.`);
      }
    } catch (err) {
      setPaciente(null);
      setDniError(extractApiErrorMessage(err, 'Error al consultar el padrón de pacientes.'));
    } finally {
      setBuscandoDni(false);
    }
  }, [dniBusqueda]);

  useEffect(() => {
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

        const activeProfs = profsData.filter((p) => p.activo !== false);
        const activeCons = consData.filter((c) => c.activo !== false);

        setCentro(centroData ?? null);
        setProfesionales(activeProfs);
        setConsultorios(activeCons);

        if (activeProfs[0]) setProfesionalId(activeProfs[0].id);
        if (activeCons[0]) setConsultorioNumero(activeCons[0].numero);
      } finally {
        setLoadingContext(false);
      }
    };

    void loadCenterContext();
  }, [scopedCentroId]);

  useEffect(() => {
    if (initialDni.length >= 7) {
      void buscarPorDni(initialDni);
    }
    // Run only when prefilled via query string on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDni]);

  useEffect(() => {
    if (!profesionalId || !fecha) {
      setSlotsDisponibles([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    turnosService
      .getDisponibles(profesionalId, fecha)
      .then((raw) => {
        if (cancelled) return;
        const normalized = Array.from(new Set(raw.map(extractSlotHHmm).filter(Boolean)));
        setSlotsDisponibles(normalized);
        setHora((prev) => (normalized.includes(prev) ? prev : normalized[0] ?? ''));
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsDisponibles([]);
        setHora('');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profesionalId, fecha]);

  const handleSubmit = async (): Promise<boolean> => {
    if (!scopedCentroId) {
      setSubmitError('Tu usuario no tiene un centro de salud asignado.');
      return false;
    }
    if (!paciente) {
      setSubmitError('Buscá y seleccioná un paciente empadronado por DNI antes de confirmar.');
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

    setSaving(true);
    setSubmitError(null);
    try {
      const nuevo = await turnosService.crearTurnoMostrador({
        fecha,
        hora: effectiveHora,
        pacienteId: paciente.id,
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`.trim(),
        pacienteDni: paciente.dni,
        pacienteTelefono: paciente.telefono || 'Sin especificar',
        obraSocial,
        copagoMonto: Number(copagoMonto) || 0,
        numeroBono: numeroBono.trim() || undefined,
        esPrimeraVez: false,
        consultorioNumero: consObj?.numero || consultorioNumero || '101',
        planta: consObj?.planta || 'Planta Baja',
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
    profesionales,
    consultorios,
    dniBusqueda,
    setDniBusqueda,
    paciente,
    buscandoDni,
    dniError,
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
    copagoMonto,
    setCopagoMonto,
    numeroBono,
    setNumeroBono,
    motivoConsulta,
    setMotivoConsulta,
    loadingContext,
    saving,
    submitError,
    buscarPorDni,
    handleSubmit,
  };
}
