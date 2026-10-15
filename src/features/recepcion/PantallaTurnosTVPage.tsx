import React, { useState, useEffect, useMemo } from 'react';
import { turnosService } from '@/api/turnosService';
import { centrosService } from '@/api/centrosService';
import { soundNotification } from '@/lib/soundNotification';
import type { Turno, CentroSalud } from '@/types';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Building2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PantallaTurnosTVPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [filtroCentro, setFiltroCentro] = useState<string>('TODOS');
  const [horaActual, setHoraActual] = useState(new Date());
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ultimoLlamadoId, setUltimoLlamadoId] = useState<string | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling automático cada 4 segundos para simular tiempo real en pantalla TV
  useEffect(() => {
    const fetchData = async () => {
      const [t, c] = await Promise.all([turnosService.getAll(), centrosService.getAll()]);
      setTurnos(t);
      setCentros(c);
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const hoyStr = new Date().toISOString().split('T')[0];

  // Turnos del día filtrados por sede
  const turnosHoy = useMemo(() => {
    return turnos.filter((t) => {
      if (t.fecha !== hoyStr) return false;
      if (filtroCentro !== 'TODOS' && t.centroSaludId !== filtroCentro) return false;
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

  // Efecto de sonido y animación cuando cambia el paciente llamado
  useEffect(() => {
    if (llamadoDestacado && llamadoDestacado.id !== ultimoLlamadoId) {
      setUltimoLlamadoId(llamadoDestacado.id);
      if (sonidoHabilitado) {
        soundNotification.playChime();
      }
    }
  }, [llamadoDestacado, ultimoLlamadoId, sonidoHabilitado]);

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
      : centros.find((c) => c.id === filtroCentro)?.nombre || 'Centro de Salud';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-primary selection:text-white font-sans overflow-hidden">
      {/* Header Superior Tótem / TV */}
      <header className="px-8 py-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
            <span className="text-xl font-black tracking-wider">ESU</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{nombreCentroActual}</span>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Pantalla Pública de Turnos y Orientación a Consultorios
            </p>
          </div>
        </div>

        {/* Controles de Pantalla y Reloj */}
        <div className="flex items-center gap-5">
          {/* Selector de Sede para el Tótem */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Building2 className="h-4 w-4 text-sky-400" />
            <select
              value={filtroCentro}
              onChange={(e) => setFiltroCentro(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none"
            >
              <option value="TODOS" className="bg-slate-900">Todas las Sedes</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Sonido */}
          <button
            onClick={() => {
              setSonidoHabilitado(!sonidoHabilitado);
              if (!sonidoHabilitado) soundNotification.playChime();
            }}
            className={`p-2 rounded-xl border transition ${
              sonidoHabilitado
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
            title={sonidoHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
          >
            {sonidoHabilitado ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Botón Pantalla Completa */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Pantalla Completa (F11)"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          {/* Reloj Digital Grande */}
          <div className="text-right pl-3 border-l border-slate-800">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              {horaActual.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Central Dividido */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden">
        {/* PANEL PRINCIPAL: Último llamado médico (Destacado Gigante) */}
        <section className="lg:col-span-8 flex flex-col justify-center">
          {llamadoDestacado ? (
            <div className="relative rounded-3xl border-2 border-sky-500/50 bg-gradient-to-b from-slate-900 via-slate-900/90 to-sky-950/40 p-8 lg:p-12 shadow-2xl shadow-sky-950/50 flex flex-col justify-between animate-in zoom-in-95 duration-300 ring-4 ring-sky-500/20">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-4 py-1.5 text-sm font-black uppercase tracking-wider animate-pulse">
                    <Sparkles className="h-4 w-4" /> ¡Llamado en curso!
                  </span>
                  {llamadoDestacado.horaLlamado && (
                    <span className="text-xs text-slate-400 font-mono">
                      Hora: {llamadoDestacado.horaLlamado} hs
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-400">
                  {llamadoDestacado.centroSaludNombre}
                </span>
              </div>

              <div className="my-10 space-y-8">
                {/* Nombre del Paciente */}
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                    Paciente Convocado
                  </span>
                  <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mt-1 truncate drop-shadow-md">
                    {llamadoDestacado.pacienteNombre}
                  </div>
                </div>

                {/* Flecha y Destino: Consultorio */}
                <div className="rounded-2xl bg-sky-500/10 border border-sky-500/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-white font-black text-2xl shadow-lg shadow-sky-600/40">
                      <ArrowRight className="h-8 w-8 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                        Por favor dirigirse a:
                      </span>
                      <div className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
                        CONSULTORIO {llamadoDestacado.consultorioNumero || '102'}
                      </div>
                      {llamadoDestacado.planta && (
                        <div className="text-sm font-semibold text-sky-300 mt-0.5">
                          Ubicación: {llamadoDestacado.planta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-sky-500/20">
                    <div className="text-xs text-slate-400">Profesional:</div>
                    <div className="text-lg font-bold text-white">{llamadoDestacado.profesionalNombre}</div>
                    <div className="text-xs text-slate-400">{llamadoDestacado.especialidadNombre}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Si no se presenta tras el segundo llamado, su turno será pospuesto.</span>
                <span className="font-mono text-slate-500">Cód: {llamadoDestacado.codigoVerificacion}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center my-auto">
              <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-300">Sala en Espera de Nuevos Llamados</h2>
              <p className="text-sm text-slate-500 mt-2">
                Los pacientes serán convocados por pantalla y audio en cuanto el profesional habilite el ingreso.
              </p>
            </div>
          )}
        </section>

        {/* PANEL LATERAL: Lista de Llamados Recientes y Próximos en Espera */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Llamados recientes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex-1 flex flex-col">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Llamados Recientes</span>
              <span className="text-[10px] text-sky-400 font-normal">Últimas atenciones</span>
            </h2>

            <div className="mt-3 space-y-2.5 overflow-y-auto flex-1">
              {turnosEnLlamado.slice(1, 6).map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm text-white">{t.pacienteNombre}</h3>
                    <p className="text-xs text-slate-400">Dr(a). {t.profesionalNombre}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-sky-500/20 text-sky-400 px-2 py-1 text-xs font-mono font-black border border-sky-500/30">
                      Cons. {t.consultorioNumero || '102'}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">{t.horaLlamado || t.hora} hs</div>
                  </div>
                </div>
              ))}
              {turnosEnLlamado.length <= 1 && (
                <p className="text-center text-xs text-slate-500 py-6 italic">No hay llamados previos registrados</p>
              )}
            </div>
          </div>

          {/* Próximos Pacientes en Sala */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 h-48 flex flex-col">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Próximos en Sala</span>
              <span className="text-xs font-mono font-bold text-amber-400">{pacientesEnEspera.length} en espera</span>
            </h2>

            <div className="mt-2 space-y-1.5 overflow-y-auto flex-1">
              {pacientesEnEspera.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/20">
                  <span className="text-slate-300 truncate max-w-[170px]">{t.pacienteNombre}</span>
                  <span className="font-mono text-slate-500">{t.hora} hs</span>
                </div>
              ))}
              {pacientesEnEspera.length === 0 && (
                <p className="text-center text-xs text-slate-600 py-3 italic">Todos los pacientes han sido llamados</p>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Pie de pantalla Tótem con cintillo informativo */}
      <footer className="px-8 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Aviso a la comunidad:</span>
          <span>Mantenga a mano su DNI y credencial médica antes de pasar al consultorio.</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Sistema de Turnos ESU • Cruz del Eje
        </div>
      </footer>
    </div>
  );
};
