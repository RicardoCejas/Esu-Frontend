import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';

const STORAGE_KEY_TV_CENTRO = 'esu_pantalla_tv_centro_id';

export const PantallaTurnosTVPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCentroId = searchParams.get('centroId') || '';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [filtroCentro, setFiltroCentro] = useState<string>(() => {
    return queryCentroId || localStorage.getItem(STORAGE_KEY_TV_CENTRO) || 'TODOS';
  });

  const [horaActual, setHoraActual] = useState(new Date());
  const { sonidoHabilitado, toggleSonido, anunciarLlamado } = useQueueAudioAnnouncement();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ultimoLlamadoIdRef = useRef<string | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actualizar localStorage y query params cuando cambia filtroCentro
  const handleCambioCentro = useCallback((nuevoId: string) => {
    setFiltroCentro(nuevoId);
    if (nuevoId && nuevoId !== 'TODOS') {
      localStorage.setItem(STORAGE_KEY_TV_CENTRO, nuevoId);
      setSearchParams({ centroId: nuevoId });
    } else {
      localStorage.removeItem(STORAGE_KEY_TV_CENTRO);
      setSearchParams({});
    }
  }, [setSearchParams]);

  // Cargar sedes inicialmente
  useEffect(() => {
    let isSubscribed = true;
    centrosService.getAll().then((data) => {
      if (isSubscribed) setCentros(data ?? []);
    }).catch(() => {});
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Polling automático cada 4 segundos de cartelera pública o turnos del centro
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        let t: Turno[] = [];
        if (filtroCentro && filtroCentro !== 'TODOS') {
          // Intentar obtener cartelera pública optimizada para TV
          t = await turnosService.getTurnosCarteleraPublica(filtroCentro).catch(async () => {
            return turnosService.getTurnosKanbanCentro(filtroCentro).catch(() => [] as Turno[]);
          });
        } else {
          t = await turnosService.getAll().catch(() => [] as Turno[]);
        }

        if (isSubscribed) {
          setTurnos(t ?? []);
        }
      } catch {
        // En caso de corte momentáneo de red, no borrar la pantalla
      }
    };

    void fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [filtroCentro]);

  const hoyStr = getFechaLocalHoy();

  // Turnos del día filtrados por sede
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => {
      if (t.fecha && t.fecha !== hoyStr) return false;
      if (filtroCentro !== 'TODOS' && t.centroSaludId && String(t.centroSaludId) !== String(filtroCentro)) {
        return false;
      }
      return true;
    });
  }, [turnos, hoyStr, filtroCentro]);

  // Turnos llamados (Atendiendo o recién llamados)
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

  // Efecto de sonido y anuncio por voz cuando cambia el paciente llamado
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
    filtroCentro === 'TODOS'
      ? 'Red de Salud Cruz del Eje'
      : centros.find((c) => String(c.id) === String(filtroCentro))?.nombre || 'Centro de Salud';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-primary selection:text-white font-sans overflow-hidden">
      {/* Header Superior Tótem / TV */}
      <header className="px-8 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-icon.png"
            alt="ESU Cruz del Eje"
            className="h-11 w-11 object-contain rounded-xl bg-white p-1 shadow-xs shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{nombreCentroActual}</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Pantalla Pública de Turnos y Orientación a Consultorios
            </p>
          </div>
        </div>

        {/* Controles de Pantalla y Reloj */}
        <div className="flex items-center gap-5">
          {/* Selector de Sede para el Tótem */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Building2 className="h-4 w-4 text-sky-400" />
            <select
              value={filtroCentro}
              onChange={(e) => handleCambioCentro(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todas las Sedes</option>
              {centros.map((c) => (
                <option key={c.id} value={String(c.id)} className="bg-slate-900 text-white">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Sonido */}
          <button
            type="button"
            onClick={toggleSonido}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              sonidoHabilitado
                ? 'border-sky-600 bg-sky-700 text-white'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
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
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Pantalla Completa (F11)"
            aria-label="Alternar Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          {/* Reloj Digital Grande */}
          <div className="text-right pl-3 border-l border-slate-800">
            <div className="text-2xl font-black tabular-nums tracking-tight text-white">
              {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-300 uppercase tracking-widest font-semibold">
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
            <div className="relative rounded-2xl border border-slate-700 bg-slate-900 p-8 lg:p-10 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-lg bg-emerald-700 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                    Llamado en curso
                  </span>
                  {llamadoDestacado.horaLlamado && (
                    <span className="text-xs text-slate-300 tabular-nums">
                      Hora: {llamadoDestacado.horaLlamado} hs
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {llamadoDestacado.centroSaludNombre}
                </span>
              </div>

              <div className="my-8 space-y-6">
                {/* Nombre del Paciente */}
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                    Paciente Convocado
                  </span>
                  <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mt-1 truncate">
                    {llamadoDestacado.pacienteNombre}
                  </div>
                </div>

                {/* Destino: Consultorio */}
                <div className="rounded-xl bg-slate-800 border border-slate-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-700 text-white font-bold text-xl shrink-0">
                      <ArrowRight className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-sky-300 tracking-wider">
                        Dirigirse a:
                      </span>
                      <div className="text-3xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                        CONSULTORIO {llamadoDestacado.consultorioNumero || 'ASIGNADO'}
                      </div>
                      {llamadoDestacado.planta && (
                        <div className="text-xs font-semibold text-slate-300 mt-0.5">
                          Ubicación: Planta {llamadoDestacado.planta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                    <div className="text-xs text-slate-400">Profesional / Especialidad:</div>
                    <div className="text-base font-bold text-white">{llamadoDestacado.profesionalNombre}</div>
                    <div className="text-xs text-slate-300">{llamadoDestacado.especialidadNombre}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Si no se presenta tras el segundo llamado, su turno será pospuesto.</span>
                <span className="tabular-nums text-slate-400">Cód: {llamadoDestacado.codigoVerificacion || `#${llamadoDestacado.id}`}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center my-auto shadow-sm">
              <Clock className="h-14 w-14 text-sky-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white">Sala de Espera Activa</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Los pacientes serán convocados por pantalla y audio en cuanto el profesional médico habilite el ingreso a consultorio.
              </p>
            </div>
          )}
        </section>

        {/* PANEL LATERAL: Lista de Llamados Recientes y Próximos en Espera */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Llamados recientes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Llamados Recientes</span>
              <span className="text-[10px] text-sky-300 font-semibold">Últimas atenciones</span>
            </h2>

            <div className="mt-3 space-y-2.5 overflow-y-auto flex-1">
              {turnosEnLlamado.slice(1, 6).map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 p-3 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm text-white">{t.pacienteNombre}</h3>
                    <p className="text-xs text-slate-300">Dr(a). {t.profesionalNombre}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-sky-700 text-white px-2 py-1 text-xs tabular-nums font-bold">
                      Cons. {t.consultorioNumero || 'S/N'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 tabular-nums">{t.horaLlamado || t.hora} hs</div>
                  </div>
                </div>
              ))}
              {turnosEnLlamado.length <= 1 && (
                <p className="text-center text-xs text-slate-400 py-6 italic">No hay llamados previos registrados</p>
              )}
            </div>
          </div>

          {/* Próximos Pacientes en Sala */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-48 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Próximos en Sala</span>
              <span className="text-xs tabular-nums font-bold text-amber-300">{pacientesEnEspera.length} en espera</span>
            </h2>

            <div className="mt-2 space-y-1.5 overflow-y-auto flex-1">
              {pacientesEnEspera.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                  <span className="text-slate-200 truncate max-w-[170px] font-medium">{t.pacienteNombre}</span>
                  <span className="tabular-nums text-slate-400">{t.hora} hs</span>
                </div>
              ))}
              {pacientesEnEspera.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-3 italic">Todos los pacientes han sido llamados</p>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Pie de pantalla Tótem con cintillo informativo */}
      <footer className="px-8 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">Aviso a la comunidad:</span>
          <span>Mantenga a mano su DNI y credencial médica antes de pasar al consultorio.</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Sistema de Turnos ESU • Cruz del Eje
        </div>
      </footer>
    </div>
  );
};
