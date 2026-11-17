import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { pacientesService } from '@/api/pacientesService';
import { clinicaService } from '@/api/clinicaService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { User, ConsultaMedica, AlergiaPaciente } from '@/types';
import {
  FileText,
  Search,
  User as UserIcon,
  Activity,
  HeartPulse,
  Pill,
  ShieldCheck,
  ChevronLeft,
  Plus,
  Stethoscope,
  Clock,
  Building2,
  X,
  Flame,
  Loader2,
  Lock,
} from 'lucide-react';

export const MedicoHistoriaClinicaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const urlPacienteId = searchParams.get('pacienteId') || '';

  const [busquedaDni, setBusquedaDni] = useState('');
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [dniConsultado, setDniConsultado] = useState<string | null>(null);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<User | null>(null);

  // Paciente seleccionado para la ficha de seguimiento
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<User | null>(null);
  const [historiaClinica, setHistoriaClinica] = useState<ConsultaMedica[]>([]);
  const [alergias, setAlergias] = useState<AlergiaPaciente[]>([]);
  const [loadingHistoria, setLoadingHistoria] = useState(false);

  // Filtros internos de la historia clínica
  const [filtroTextoHistoria, setFiltroTextoHistoria] = useState('');
  const [filtroTipoEvento, setFiltroTipoEvento] = useState<'TODOS' | 'CONSULTAS' | 'RECETAS' | 'ADENDAS'>('TODOS');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modal para agregar Nota de Evolución de Seguimiento Rápida
  const [isModalNotaOpen, setIsModalNotaOpen] = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [notaMotivo, setNotaMotivo] = useState('');
  const [notaEvolucion, setNotaEvolucion] = useState('');
  const [notaDiagnostico, setNotaDiagnostico] = useState('');
  const [notaCie10, setNotaCie10] = useState('');
  const [notaTratamiento, setNotaTratamiento] = useState('');

  // 1. Si viene pacienteId por URL, cargar únicamente ese paciente autorizado (sin listar el padrón)
  useEffect(() => {
    if (!urlPacienteId) return;
    let isMounted = true;

    pacientesService
      .getById(urlPacienteId)
      .then((encontrado) => {
        if (isMounted && encontrado) {
          setPacienteSeleccionado(encontrado);
        }
      })
      .catch((err) => {
        console.error('Error cargando paciente por ID:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [urlPacienteId]);

  // 2. Búsqueda exclusiva por DNI exacto (resguardo de privacidad del padrón)
  const ejecutarBusquedaPorDni = async (dniRaw: string) => {
    const cleanDni = dniRaw.replace(/\D/g, '');
    if (cleanDni.length < 7) {
      setPacienteEncontrado(null);
      setDniConsultado(null);
      return;
    }

    setBuscandoDni(true);
    setDniConsultado(cleanDni);
    try {
      const encontrado = await pacientesService.getByDni(cleanDni);
      setPacienteEncontrado(encontrado ?? null);
    } catch {
      setPacienteEncontrado(null);
    } finally {
      setBuscandoDni(false);
    }
  };

  useEffect(() => {
    const cleanDni = busquedaDni.replace(/\D/g, '');
    if (cleanDni.length < 7) {
      setPacienteEncontrado(null);
      setDniConsultado(null);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setBuscandoDni(true);
      setDniConsultado(cleanDni);
      try {
        const encontrado = await pacientesService.getByDni(cleanDni);
        if (active) {
          setPacienteEncontrado(encontrado ?? null);
        }
      } catch {
        if (active) setPacienteEncontrado(null);
      } finally {
        if (active) setBuscandoDni(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [busquedaDni]);

  // 3. Cargar historia clínica y alergias del paciente seleccionado
  useEffect(() => {
    if (!pacienteSeleccionado) {
      setHistoriaClinica([]);
      setAlergias([]);
      return;
    }

    let isMounted = true;
    setLoadingHistoria(true);

    const targetId = pacienteSeleccionado.pacienteId || pacienteSeleccionado.id;

    Promise.allSettled([
      pacientesService.getHistoriaClinica(targetId),
      clinicaService.getAlergias(targetId),
    ])
      .then(([resHistoria, resAlergias]) => {
        if (!isMounted) return;

        if (resHistoria.status === 'fulfilled') {
          setHistoriaClinica(resHistoria.value || []);
        } else {
          setHistoriaClinica([]);
        }

        if (resAlergias.status === 'fulfilled') {
          setAlergias(resAlergias.value || []);
        } else {
          setAlergias([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingHistoria(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pacienteSeleccionado]);

  // Selección de un paciente de la lista
  const handleSeleccionarPaciente = (p: User) => {
    setPacienteSeleccionado(p);
    setSearchParams({ pacienteId: String(p.id) });
  };

  const handleVolverAlBuscador = () => {
    setPacienteSeleccionado(null);
    setSearchParams({});
  };

  // Filtrado de eventos en la historia clínica del paciente
  const consultasFiltradas = useMemo(() => {
    return historiaClinica.filter((c) => {
      // Filtro por fechas
      if (fechaDesde && c.fecha < fechaDesde) return false;
      if (fechaHasta && c.fecha > fechaHasta) return false;

      // Filtro por tipo
      if (filtroTipoEvento === 'RECETAS' && !c.receta) return false;
      if (filtroTipoEvento === 'CONSULTAS' && c.receta) return false;
      if (filtroTipoEvento === 'ADENDAS' && !c.diagnostico?.includes('[CORRECCIÓN') && !c.motivo?.includes('[ADENDA')) return false;

      // Filtro por texto
      if (!filtroTextoHistoria.trim()) return true;
      const term = filtroTextoHistoria.toLowerCase();
      const matchMotivo = (c.motivo || '').toLowerCase().includes(term);
      const matchDiag = (c.diagnostico || '').toLowerCase().includes(term);
      const matchTrat = (c.tratamiento || '').toLowerCase().includes(term);
      const matchProf = (c.profesionalNombre || '').toLowerCase().includes(term);

      return matchMotivo || matchDiag || matchTrat || matchProf;
    });
  }, [historiaClinica, filtroTextoHistoria, filtroTipoEvento, fechaDesde, fechaHasta]);

  // Guardar Nota de Seguimiento Rápida
  const handleGuardarNotaSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSeleccionado) return;
    if (!notaMotivo.trim() || !notaEvolucion.trim()) {
      toastError('Debés ingresar el motivo y el texto de la evolución clínica.');
      return;
    }

    setGuardandoNota(true);
    try {
      const targetId = pacienteSeleccionado.pacienteId || pacienteSeleccionado.id;
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Registrar como evolución directa
      const diag = notaDiagnostico.trim() || 'Control evolutivo programado';
      const profId = Number(user?.profesionalId || user?.usuarioId || user?.id || 1);
      await clinicaService.registrarEvolucionDirecta({
        pacienteId: Number(targetId),
        profesionalId: profId,
        motivoConsulta: `[SEGUIMIENTO HCU] ${notaMotivo.trim()}`,
        anamnesis: notaEvolucion.trim(),
        diagnostico: diag,
        diagnosticoTexto: diag,
        codigoCie10: notaCie10.trim() || undefined,
        tratamiento: notaTratamiento.trim() || undefined,
      });

      // Crear consulta local para reflejo inmediato
      const nuevaConsulta: ConsultaMedica = {
        id: `ev-${Date.now()}`,
        pacienteId: String(targetId),
        pacienteNombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
        profesionalId: String(user?.id || '1'),
        profesionalNombre: `${user?.nombre || 'Dr/a'} ${user?.apellido || 'Médico'}`,
        fecha: fechaHoy,
        hora: horaActual,
        motivo: `[SEGUIMIENTO HCU] ${notaMotivo.trim()}`,
        diagnostico: notaDiagnostico.trim() || 'Control evolutivo en seguimiento',
        tratamiento: notaTratamiento.trim() || notaEvolucion.trim(),
      };

      setHistoriaClinica([nuevaConsulta, ...historiaClinica]);
      success('Nota de evolución registrada exitosamente en la Historia Clínica Única.');
      setIsModalNotaOpen(false);

      // Limpiar formulario
      setNotaMotivo('');
      setNotaEvolucion('');
      setNotaDiagnostico('');
      setNotaCie10('');
      setNotaTratamiento('');
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'Error al registrar la evolución de seguimiento.'));
    } finally {
      setGuardandoNota(false);
    }
  };

  const calcularEdad = (fechaNac?: string): string => {
    if (!fechaNac) return 'Edad sin registrar';
    const match = fechaNac.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return fechaNac;
    const year = Number(match[1]);
    const age = new Date().getFullYear() - year;
    return age > 0 ? `${age} años` : 'Menor de 1 año';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* VISTA 1: BUSCADOR GENERAL DE PACIENTES (Si no hay paciente seleccionado)  */}
      {/* ========================================================================= */}
      {!pacienteSeleccionado ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-md">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    Seguimiento de Historia Clínica Única (HCU)
                  </h1>
                  <span className="rounded-full bg-sky-100 border border-sky-300 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
                    Padrón Cruz del Eje
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Acceso longitudinal a antecedentes médicos, evoluciones clínicas, recetas activas y resultados diagnósticos.
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Búsqueda Exclusiva por DNI (Privacidad de Padrón) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ejecutarBusquedaPorDni(busquedaDni);
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                {buscandoDni ? (
                  <Loader2 className="absolute left-3.5 top-3 h-4 w-4 animate-spin text-sky-600" />
                ) : (
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-sky-700" />
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  value={busquedaDni}
                  onChange={(e) => setBusquedaDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ingresá el DNI del paciente sin puntos (ej: 40026880)..."
                  maxLength={10}
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/40 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition font-mono"
                  autoFocus
                />
                {busquedaDni && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaDni('');
                      setPacienteEncontrado(null);
                      setDniConsultado(null);
                    }}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                    title="Limpiar DNI"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={buscandoDni || busquedaDni.replace(/\D/g, '').length < 7}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Buscar por DNI</span>
              </button>
            </div>

            {/* Aviso de privacidad médica */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium px-1">
              <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                Por resguardo de privacidad (Ley 26.529), no se lista el padrón completo. Solicitá el DNI al paciente para acceder a su historia clínica.
              </span>
            </div>
          </form>

          {/* Resultado único por DNI */}
          {buscandoDni ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-600 border-t-transparent" />
                <span className="text-xs font-semibold text-slate-500">Buscando DNI {busquedaDni}...</span>
              </div>
            </div>
          ) : !dniConsultado ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Acceso protegido por DNI del paciente</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Ingresá el número de documento (7 u 8 dígitos) proporcionado por el paciente para visualizar su Historia Clínica Única y registrar evoluciones.
              </p>
            </div>
          ) : !pacienteEncontrado ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-bold text-slate-900">No se encontró paciente con DNI {dniConsultado}</h3>
              <p className="mt-1 text-xs text-slate-500">
                Verificá los dígitos ingresados o confirmá si el paciente se encuentra empadronado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusquedaDni('');
                  setPacienteEncontrado(null);
                  setDniConsultado(null);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer"
              >
                Ingresar otro DNI
              </button>
            </div>
          ) : (
            <div className="max-w-md">
              {(() => {
                const p = pacienteEncontrado;
                const edad = calcularEdad(p.fechaNacimiento);
                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-2xl border border-sky-200 bg-white p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition space-y-4"
                  >
                    <div>
                      {/* Cabecera del Paciente */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-sm font-black text-white shadow-xs">
                            {p.nombre?.charAt(0)}
                            {p.apellido?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {p.apellido}, {p.nombre}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              DNI <strong className="text-slate-700 font-mono">{p.dni || 'Sin DNI'}</strong>
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                          {p.obraSocial || 'Particular'}
                        </span>
                      </div>

                      {/* Datos de contacto y residencia */}
                      <div className="mt-3.5 space-y-1 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Edad:</span>
                          <span className="font-semibold text-slate-700">{edad}</span>
                        </div>
                        {p.telefono && (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Teléfono:</span>
                            <span className="font-semibold text-slate-700">{p.telefono}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Historia Clínica:</span>
                          <span className="font-mono text-[11px] font-bold text-sky-800">
                            HC-{p.dni || p.id}-CDE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acceso a la HCU */}
                    <button
                      type="button"
                      onClick={() => handleSeleccionarPaciente(p)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white hover:bg-sky-800 shadow-xs transition cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Ver Historia Clínica Completa</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VISTA 2: FICHA LONGITUDINAL DEL PACIENTE SELECCIONADO                     */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Botón superior de retorno */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleVolverAlBuscador}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>← Volver a buscar otros pacientes</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Historia Clínica N° <strong className="text-slate-800 font-mono">HC-{pacienteSeleccionado.dni || pacienteSeleccionado.id}-CDE</strong>
            </span>
          </div>

          {/* Tarjeta de Identidad y Datos del Paciente */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-indigo-800 text-2xl font-black text-white shadow-md">
                  {pacienteSeleccionado.nombre?.charAt(0)}
                  {pacienteSeleccionado.apellido?.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                    </h2>
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      Padrón Activo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    DNI <strong className="text-slate-800 font-mono">{pacienteSeleccionado.dni || 'Sin registrar'}</strong> •{' '}
                    Edad: <strong>{calcularEdad(pacienteSeleccionado.fechaNacimiento)}</strong> • Cobertura:{' '}
                    <strong className="text-sky-700">{pacienteSeleccionado.obraSocial || 'Particular'}</strong>
                    {pacienteSeleccionado.nroAfiliado && ` (Af. ${pacienteSeleccionado.nroAfiliado})`}
                  </p>
                </div>
              </div>

              {/* Botones de acción directa con el paciente */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalNotaOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Nota de Evolución Rápida</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/medico/recetas?pacienteId=${pacienteSeleccionado.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
                >
                  <Pill className="h-4 w-4" />
                  <span>Prescribir Receta</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/medico/atencion?pacienteId=${pacienteSeleccionado.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Iniciar Atención Clínica</span>
                </button>
              </div>
            </div>

            {/* Alertas Críticas Médicas (HU-49) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <Flame className="h-4 w-4 text-rose-600" />
                  <span>Alergias Críticas Registradas</span>
                </div>
                {alergias.length > 0 ? (
                  <div className="space-y-1">
                    {alergias.map((a) => (
                      <span
                        key={a.id}
                        className="inline-block rounded-md bg-rose-100 text-rose-900 px-2 py-0.5 text-[11px] font-bold mr-1"
                      >
                        {a.sustanciaAlergeno} ({a.severidad})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">Sin alergias severas registradas</p>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <HeartPulse className="h-4 w-4 text-amber-600" />
                  <span>Antecedentes Patológicos</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Hipertensión arterial esencial en seguimiento. Esquema de medicación oral habitual. Sin cirugías mayores previas.
                </p>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sky-800 font-bold">
                  <Building2 className="h-4 w-4 text-sky-700" />
                  <span>Centro de Salud de Referencia</span>
                </div>
                <p className="text-slate-700 text-xs font-semibold">
                  {pacienteSeleccionado.centroSaludNombre || 'Hospital Regional Dr. Aurelio Crespo'}
                </p>
                <span className="text-[10px] text-slate-400 block">Cruz del Eje, Córdoba</span>
              </div>
            </div>
          </div>

          {/* Sección de Timeline Clínico y Filtros de Consulta */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Historial Longitudinal de Atenciones y Consultas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evoluciones inalterables firmadas electrónicamente con trazabilidad Ley 25.506
                  </p>
                </div>
              </div>

              {/* Conteo de registros */}
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 self-start sm:self-auto">
                {consultasFiltradas.length} atenciones registradas
              </span>
            </div>

            {/* Controles y Filtros del Timeline */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={filtroTextoHistoria}
                  onChange={(e) => setFiltroTextoHistoria(e.target.value)}
                  placeholder="Buscar en evoluciones (diagnóstico, motivo, tratamiento, profesional)..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  title="Fecha desde"
                />
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  title="Fecha hasta"
                />
                {(['TODOS', 'CONSULTAS', 'RECETAS', 'ADENDAS'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipoEvento(tipo)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      filtroTipoEvento === tipo
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tipo === 'TODOS'
                      ? 'Todos'
                      : tipo === 'CONSULTAS'
                      ? 'Consultas'
                      : tipo === 'RECETAS'
                      ? 'Recetas'
                      : 'Adendas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Cronológica de Atenciones */}
            {loadingHistoria ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-600 border-t-transparent" />
              </div>
            ) : consultasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <Clock className="mx-auto h-10 w-10 text-slate-400" />
                <h4 className="mt-2 text-xs font-bold text-slate-800">
                  Sin registros clínicos para los filtros aplicados
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 max-w-sm mx-auto">
                  Este paciente no tiene evoluciones bajo los criterios seleccionados. Podés asentar una nota de seguimiento ahora.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalNotaOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Registrar Evolución Inicial</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultasFiltradas.map((c, index) => (
                  <div
                    key={c.id || index}
                    className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 transition space-y-3"
                  >
                    {/* Encabezado del Evento Clínico */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {c.motivo || 'Consulta Médica General'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Atendido por: <strong className="text-slate-700">{c.profesionalNombre || 'Profesional Médico'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                          {c.fecha} {c.hora ? `• ${c.hora} hs` : ''}
                        </span>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                          ✓ Firmada Digitalmente
                        </span>
                      </div>
                    </div>

                    {/* Contenido Clínico */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Diagnóstico */}
                      <div className="rounded-xl bg-sky-50/40 border border-sky-100 p-3 space-y-1">
                        <span className="text-[11px] font-bold text-sky-900 block">
                          Diagnóstico Clínico Registrado
                        </span>
                        <p className="text-slate-800 font-semibold">{c.diagnostico}</p>
                      </div>

                      {/* Tratamiento o Plan */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Tratamiento e Indicaciones Médicas
                        </span>
                        <p className="text-slate-800">{c.tratamiento}</p>
                      </div>
                    </div>

                    {/* Receta Asociada */}
                    {c.receta && (
                      <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-3 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-emerald-700" />
                          <div>
                            <span className="font-bold text-emerald-950 block">Receta Médica Digital Asociada</span>
                            <span className="text-[11px] text-emerald-800">
                              {c.receta.medicamentos && c.receta.medicamentos.length > 0
                                ? `${c.receta.medicamentos[0].droga} • Dosis: ${c.receta.medicamentos[0].dosisIndicada}`
                                : 'Prescripción digital oficial'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                          Ley 27.553
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NOTA DE EVOLUCIÓN RÁPIDA DE SEGUIMIENTO                  */}
      {/* ========================================================================= */}
      {isModalNotaOpen && pacienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-black">Asentar Evolución de Seguimiento</h3>
                  <p className="text-[11px] text-slate-300">
                    Paciente: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido} (DNI {pacienteSeleccionado.dni})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalNotaOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNotaSeguimiento} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Motivo de Seguimiento o Consulta *</label>
                <input
                  type="text"
                  required
                  value={notaMotivo}
                  onChange={(e) => setNotaMotivo(e.target.value)}
                  placeholder="ej: Control evolutivo de hipertensión arterial / Revisión de análisis"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Texto de Evolución Clínica y Hallazgos *</label>
                <textarea
                  rows={4}
                  required
                  value={notaEvolucion}
                  onChange={(e) => setNotaEvolucion(e.target.value)}
                  placeholder="Describí los hallazgos del examen físico, evolución de síntomas, respuesta al tratamiento..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Diagnóstico Conclusivo</label>
                  <input
                    type="text"
                    value={notaDiagnostico}
                    onChange={(e) => setNotaDiagnostico(e.target.value)}
                    placeholder="ej: HTA compensada / Faringitis en resolución"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Código CIE-10</label>
                  <input
                    type="text"
                    value={notaCie10}
                    onChange={(e) => setNotaCie10(e.target.value)}
                    placeholder="ej: I10"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Plan Terapéutico y Conducta</label>
                <textarea
                  rows={2}
                  value={notaTratamiento}
                  onChange={(e) => setNotaTratamiento(e.target.value)}
                  placeholder="ej: Continuar con Losartán 50mg/día. Control de TA en 15 días en dispensario."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalNotaOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNota}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-2 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{guardandoNota ? 'Firmando y Guardando...' : 'Firmar y Asentar en HCU'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
