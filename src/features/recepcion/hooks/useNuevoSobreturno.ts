import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { pacientesService } from '@/api/pacientesService';
import { profesionalesService } from '@/api/profesionalesService';
import { turnosService } from '@/api/turnosService';
import {
  LIMITE_SOBRETURNOS_DIARIOS,
  MOTIVOS_SOBRETURNO,
  validarCupoSobreturno,
  validarDatosSobreturno,
} from '@/lib/sobreturnoRules';
import type { Profesional, User } from '@/types';

/**
 * Coordinates emergency walk-in overbooking (sobreturno) creation per center physician
 * while enforcing daily quota limits against real center data.
 */
export function useNuevoSobreturno() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const centroSaludId = user?.centroSaludId ? String(user.centroSaludId) : '';
  const initialDni = (searchParams.get('dni') || '').replace(/\D/g, '');
  const initialProfId = searchParams.get('profesionalId') || '';
  const hoy = new Date().toLocaleDateString('en-CA');

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [profesionalId, setProfesionalId] = useState(initialProfId);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState('');
  const [sobreturnosCount, setSobreturnosCount] = useState(0);
  const [loadingCupo, setLoadingCupo] = useState(false);

  const [dniBusqueda, setDniBusqueda] = useState(initialDni);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<User | null>(null);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState(initialDni);
  const [telefono, setTelefono] = useState('');
  const [obraSocial, setObraSocial] = useState('Particular / Sin Obra Social');
  const [motivo, setMotivo] = useState(MOTIVOS_SOBRETURNO[0] ?? 'Demanda Espontánea en Sala');
  const [observacion, setObservacion] = useState('');

  const [loadingContext, setLoadingContext] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buscarPorDni = useCallback(async (rawDni?: string) => {
    const clean = (rawDni ?? dniBusqueda).replace(/\D/g, '');
    if (clean.length < 7) {
      setDniError('Ingresá al menos 7 dígitos del DNI para buscar en el padrón.');
      return;
    }

    setBuscandoDni(true);
    setDniError(null);
    try {
      const found = await pacientesService.getByDni(clean);
      if (found) {
        setPacienteEncontrado(found);
        setNombre(found.nombre ?? '');
        setApellido(found.apellido ?? '');
        setDni(found.dni ?? clean);
        setTelefono(found.telefono ?? '');
        setObraSocial(found.obraSocial ?? 'Particular / Sin Obra Social');
      } else {
        setPacienteEncontrado(null);
        setDni(clean);
        setDniError('Paciente no registrado aún. Completá los datos manualmente o registralo en el padrón.');
      }
    } catch (err) {
      setDniError(extractApiErrorMessage(err, 'No se pudo consultar el DNI.'));
    } finally {
      setBuscandoDni(false);
    }
  }, [dniBusqueda]);

  useEffect(() => {
    const loadCenter = async () => {
      setLoadingContext(true);
      try {
        const [profs, cons] = await Promise.all([
          centroSaludId
            ? profesionalesService.getByCentro(centroSaludId).catch(() => [] as Profesional[])
            : profesionalesService.getAll().catch(() => [] as Profesional[]),
          centroSaludId
            ? centrosService.getConsultorios(centroSaludId).catch(() => [] as ConsultorioItem[])
            : Promise.resolve([] as ConsultorioItem[]),
        ]);
        const activeProfs = profs.filter((p) => p.activo !== false);
        const activeCons = cons.filter((c) => c.activo !== false);
        setProfesionales(activeProfs);
        setConsultorios(activeCons);

        if (!initialProfId && activeProfs[0]) {
          setProfesionalId(activeProfs[0].id);
        }
        if (activeCons[0]) {
          setConsultorioSeleccionado(`${activeCons[0].numero} (${activeCons[0].planta})`);
        }
      } finally {
        setLoadingContext(false);
      }
    };

    void loadCenter();
  }, [centroSaludId, initialProfId]);

  useEffect(() => {
    if (initialDni.length >= 7) {
      void buscarPorDni(initialDni);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDni]);

  useEffect(() => {
    if (!profesionalId) {
      setSobreturnosCount(0);
      return;
    }

    let cancelled = false;
    setLoadingCupo(true);
    turnosService
      .getByProfesional(profesionalId, {
        fecha: hoy,
        centroSaludId: centroSaludId || undefined,
      })
      .then((turnosDia) => {
        if (cancelled) return;
        const count = turnosDia.filter((t) => t.esSobreturno && t.estado !== 'CANCELADO').length;
        setSobreturnosCount(count);
      })
      .catch(() => {
        if (!cancelled) setSobreturnosCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingCupo(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profesionalId, centroSaludId, hoy]);

  const { cupoAlcanzado, cuposRestantes } = validarCupoSobreturno(sobreturnosCount);

  const handleSubmit = async (): Promise<boolean> => {
    const validacion = validarDatosSobreturno({
      profesionalId,
      centroSaludId,
      sobreturnosHoyCount: sobreturnosCount,
      nombre,
      apellido,
      dni,
      motivo,
      observacion,
    });

    if (!validacion.valido) {
      setSubmitError(validacion.error || 'Revisá los datos ingresados.');
      return false;
    }

    const now = new Date();
    const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setSaving(true);
    setSubmitError(null);
    try {
      const creado = await turnosService.crearSobreturno({
        profesionalId,
        pacienteId: pacienteEncontrado?.id,
        pacienteDni: dni.replace(/\D/g, ''),
        pacienteNombre: `${nombre.trim()} ${apellido.trim()}`.trim(),
        pacienteTelefono: telefono.trim() || undefined,
        obraSocial: obraSocial.trim() || 'Particular',
        centroSaludId,
        fecha: hoy,
        hora: horaActual,
        motivoSobreturno: consultorioSeleccionado
          ? `${validacion.motivoCompleto} - Cons. ${consultorioSeleccionado}`
          : validacion.motivoCompleto,
      });

      success(`Sobreturno asignado en sala de espera para ${creado.pacienteNombre}.`);
      navigate('/dashboard/recepcion/kanban');
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo asignar el sobreturno.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    centroSaludId,
    limiteDiario: LIMITE_SOBRETURNOS_DIARIOS,
    motivosDisponibles: MOTIVOS_SOBRETURNO,
    profesionales,
    consultorios,
    profesionalId,
    setProfesionalId,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    sobreturnosCount,
    cupoAlcanzado,
    cuposRestantes,
    loadingCupo,
    dniBusqueda,
    setDniBusqueda,
    pacienteEncontrado,
    buscandoDni,
    dniError,
    nombre,
    setNombre,
    apellido,
    setApellido,
    dni,
    setDni,
    telefono,
    setTelefono,
    obraSocial,
    setObraSocial,
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    loadingContext,
    saving,
    submitError,
    buscarPorDni,
    handleSubmit,
  };
}
