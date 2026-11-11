import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { turnosService } from '@/api/turnosService';
import { centrosService } from '@/api/centrosService';
import { useQueueAudioAnnouncement } from './hooks/useQueueAudioAnnouncement';
import { getFechaLocalHoy } from '@/lib/dateUtils';
import type { Turno, CentroSalud } from '@/types';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Building2,
} from 'lucide-react';

export const PantallaTurnosTVPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const paramCentroId = searchParams.get('centroId') || '';
  const activeCentroId = paramCentroId || (user?.centroSaludId ? String(user.centroSaludId) : '');

  const [centro, setCentro] = useState<CentroSalud | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [horaActual, setHoraActual] = useState(new Date());
  const { sonidoHabilitado, toggleSonido, anunciarLlamado } = useQueueAudioAnnouncement();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ultimoLlamadoIdRef = useRef<string | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos de la sede asignada
  useEffect(() => {
    if (!activeCentroId) return;
    let isSubscribed = true;

    centrosService
      .getById(activeCentroId)
      .then((data) => {
        if (isSubscribed && data) {
          setCentro(data);
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [activeCentroId]);

  // Polling automático cada 4 segundos de cartelera pública para el centro específico
  useEffect(() => {
    if (!activeCentroId) return;
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const data = await turnosService
          .getTurnosCarteleraPublica(activeCentroId)
          .catch(async () => {
            return turnosService.getTurnosKanbanCentro(activeCentroId).catch(() => [] as Turno[]);
          });

        if (isSubscribed) {
          setTurnos(data ?? []);
        }
      } catch {
        // En caso de intermitencia temporal de red, retener el estado actual
      }
    };

    void fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeCentroId]);

  const hoyStr = getFechaLocalHoy();

  // Filtrado defensivo de turnos del día para este centro
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => {
      if (t.fecha && t.fecha !== hoyStr) return false;
      if (activeCentroId && t.centroSaludId && String(t.centroSaludId) !== String(activeCentroId)) {
        return false;
      }
      return true;
    });
  }, [turnos, hoyStr, activeCentroId]);

  // Turnos en llamado (Atendiendo)
  const turnosEnLlamado = useMemo(() => {
    return turnosHoy
      .filter((t) => t.estado === 'ATENDIENDO')
      .sort((a, b) => (b.horaLlamado || '').localeCompare(a.horaLlamado || ''));
  }, [turnosHoy]);

  // Pacientes en espera para la columna de próximos
  const pacientesEnEspera = useMemo(() => {
    return turnosHoy.filter((t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA');
  }, [turnosHoy]);

  const llamadoDestacado = turnosEnLlamado[0] || null;

  // Anuncio por voz y chime al ingresar un nuevo paciente en llamado
  useEffect(() => {
    if (llamadoDestacado && llamadoDestacado.id !== ultimoLlamadoIdRef.current) {
      ultimoLlamadoIdRef.current = llamadoDestacado.id;
      if (sonidoHabilitado) {
        anunciarLlamado(llamadoDestacado.pacienteNombre, llamadoDestacado.consultorioNumero || '1');
      }
    }
  }, [llamadoDestacado, anunciarLlamado, sonidoHabilitado]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const nombreCentroActual =
    centro?.nombre ||
    (user?.centroSaludId && String(user.centroSaludId) === String(activeCentroId)
      ? user.centroSaludNombre
      : null) ||
    'Centro de Salud';

  // Si no se proveyó un centroId válido en URL ni por usuario autenticado
  if (!activeCentroId) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-300 rounded-3xl p-8 shadow-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pantalla no vinculada a una institución
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Esta pantalla pública de turnos debe accederse mediante el enlace institucional único correspondiente a su centro de salud para proyectar exclusivamente los llamados de su sala de espera.
          </p>

          {user?.centroSaludId ? (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Su usuario está adscrito a:</p>
              <div className="text-sm font-bold text-slate-800 mb-4">{user.centroSaludNombre}</div>
              <Link
                to={`/pantalla-turnos?centroId=${user.centroSaludId}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs transition"
              >
                <span>Abrir Pantalla de mi Centro</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-slate-200 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
                Seleccionar sede para proyectar:
              </p>
              <div className="space-y-2">
                <Link
                  to="/pantalla-turnos?centroId=1"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-sky-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                      Hospital Provincial Dr. Aurelio Crespo
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-700 transition shrink-0" />
                </Link>
                <Link
                  to="/pantalla-turnos?centroId=2"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-sky-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                      Clínica Cabrera
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-700 transition shrink-0" />
                </Link>
                <Link
                  to="/pantalla-turnos?centroId=3"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-sky-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                      Centro de Diagnóstico por Imágenes
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-700 transition shrink-0" />
                </Link>
                <Link
                  to="/pantalla-turnos?centroId=5"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-sky-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                      Sanatorio María Isabel
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-700 transition shrink-0" />
                </Link>
              </div>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link
              to="/dashboard/recepcion"
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold underline underline-offset-4"
            >
              Volver al Panel de Recepción
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col justify-between selection:bg-sky-600 selection:text-white font-sans overflow-hidden">
      {/* Header Superior Tótem / TV en tonos claros */}
      <header className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <img
            src="/logo-icon.png"
            alt="ESU Cruz del Eje"
            className="h-11 w-11 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shadow-2xs shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{nombreCentroActual}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pantalla Pública de Turnos y Orientación a Consultorios
            </p>
          </div>
        </div>

        {/* Controles de Pantalla, Identidad de Sede y Reloj */}
        <div className="flex items-center gap-5">
          {/* Identificador institucional fijo (sin selector) */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0" />
            <span>Turnero Oficial de Sede</span>
          </div>

          {/* Botón de Sonido */}
          <button
            type="button"
            onClick={toggleSonido}
            className={`p-2.5 rounded-xl border transition cursor-pointer shadow-2xs ${
              sonidoHabilitado
                ? 'border-sky-700 bg-sky-700 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title={sonidoHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
            aria-label={sonidoHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
          >
            {sonidoHabilitado ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-2xs"
            title="Pantalla Completa (F11)"
            aria-label="Alternar Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          {/* Reloj Digital Grande */}
          <div className="text-right pl-4 border-l border-slate-200">
            <div className="text-2xl font-black tabular-nums tracking-tight text-slate-900">
              {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
              {horaActual.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Central Dividido */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden">
        {/* PANEL PRINCIPAL: Último llamado médico (Destacado Gigante) */}
        <section className="lg:col-span-8 flex flex-col justify-center" aria-live="polite">
          {llamadoDestacado ? (
            <div className="relative rounded-3xl border-2 border-sky-600 bg-white p-8 lg:p-10 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-lg bg-emerald-700 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-2xs">
                    Llamado en curso
                  </span>
                  {llamadoDestacado.horaLlamado && (
                    <span className="text-xs text-slate-500 font-semibold tabular-nums">
                      Hora: {llamadoDestacado.horaLlamado} hs
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-sky-900 bg-sky-50 px-3 py-1 rounded-md border border-sky-200">
                  {llamadoDestacado.centroSaludNombre || nombreCentroActual}
                </span>
              </div>

              <div className="my-8 space-y-6">
                {/* Nombre del Paciente */}
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                    Paciente Convocado
                  </span>
                  <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mt-1 truncate">
                    {llamadoDestacado.pacienteNombre}
                  </div>
                </div>

                {/* Destino: Consultorio */}
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-600 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-700 text-white font-bold text-2xl shrink-0 shadow-sm">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-black text-sky-900 tracking-wider">
                        Dirigirse a:
                      </span>
                      <div className="text-3xl sm:text-5xl font-black text-sky-950 tracking-tight tabular-nums">
                        CONSULTORIO {llamadoDestacado.consultorioNumero || 'ASIGNADO'}
                      </div>
                      {llamadoDestacado.planta && (
                        <div className="text-xs font-bold text-sky-800 mt-0.5">
                          Ubicación: Planta {llamadoDestacado.planta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-sky-200">
                    <div className="text-xs text-slate-600 font-medium">Profesional / Especialidad:</div>
                    <div className="text-lg font-black text-slate-900">{llamadoDestacado.profesionalNombre}</div>
                    <div className="text-xs font-bold text-sky-800">{llamadoDestacado.especialidadNombre}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
                <span>Si no se presenta tras el segundo llamado, su turno será pospuesto.</span>
                <span className="tabular-nums font-semibold text-slate-700">Cód: {llamadoDestacado.codigoVerificacion || `#${llamadoDestacado.id}`}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center my-auto shadow-sm">
              <div className="h-20 w-20 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-sky-700" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sala de Espera Activa</h2>
              <p className="text-base text-slate-600 mt-2 max-w-lg mx-auto font-medium leading-relaxed">
                Los pacientes serán convocados por pantalla y audio en cuanto el profesional médico habilite el ingreso al consultorio asignado.
              </p>
            </div>
          )}
        </section>

        {/* PANEL LATERAL: Lista de Llamados Recientes y Próximos en Espera */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Llamados recientes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 flex-1 flex flex-col shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold">Llamados Recientes</span>
              <span className="text-[11px] text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                Últimas atenciones
              </span>
            </h2>

            <div className="mt-3 space-y-2.5 overflow-y-auto flex-1">
              {turnosEnLlamado.slice(1, 6).map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{t.pacienteNombre}</h3>
                    <p className="text-xs text-slate-600 font-medium">Dr(a). {t.profesionalNombre}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-sky-700 text-white px-2.5 py-1 text-xs tabular-nums font-bold shadow-2xs">
                      Cons. {t.consultorioNumero || 'S/N'}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 tabular-nums font-semibold">
                      {t.horaLlamado || t.hora} hs
                    </div>
                  </div>
                </div>
              ))}
              {turnosEnLlamado.length <= 1 && (
                <p className="text-center text-xs text-slate-400 py-8 italic font-medium">
                  No hay llamados previos registrados
                </p>
              )}
            </div>
          </div>

          {/* Próximos Pacientes en Sala */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-52 flex flex-col shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold">Próximos en Sala</span>
              <span className="text-xs tabular-nums font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {pacientesEnEspera.length} en espera
              </span>
            </h2>

            <div className="mt-2.5 space-y-2 overflow-y-auto flex-1">
              {pacientesEnEspera.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="text-slate-800 truncate max-w-[170px] font-semibold">{t.pacienteNombre}</span>
                  <span className="tabular-nums font-bold text-slate-600">{t.hora} hs</span>
                </div>
              ))}
              {pacientesEnEspera.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 italic font-medium">
                  Todos los pacientes han sido llamados
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Pie de pantalla Tótem con aviso informativo */}
      <footer className="px-8 py-3.5 border-t border-slate-200 bg-white text-xs text-slate-600 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900">Aviso a la comunidad:</span>
          <span className="font-medium">Mantenga a mano su DNI y credencial médica antes de pasar al consultorio.</span>
        </div>
        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
          Sistema de Salud ESU • Cruz del Eje
        </div>
      </footer>
    </div>
  );
};
