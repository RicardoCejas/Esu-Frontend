import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { turnosService } from '@/api/turnosService';
import { centrosService } from '@/api/centrosService';
import { soundNotification } from '@/lib/soundNotification';
import type { Turno, CentroSalud } from '@/types';
import {
  ArrowRight,
  Building2,
  Volume2,
  MonitorPlay,
  CheckCircle2
} from 'lucide-react';

export const SalasEsperaKanbanPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [filtroCentro, setFiltroCentro] = useState<string>('TODOS');
  const [filtroPlanta, setFiltroPlanta] = useState<string>('TODOS');
  const [loading, setLoading] = useState(true);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>('102');

  useEffect(() => {
    Promise.all([turnosService.getAll(), centrosService.getAll()]).then(([t, c]) => {
      setTurnos(t);
      setCentros(c);
      setLoading(false);
    });
  }, []);

  const hoyStr = new Date().toISOString().split('T')[0];

  // Turnos del día filtrados por sede y planta
  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      if (t.fecha !== hoyStr) return false;
      const matchCentro = filtroCentro === 'TODOS' || t.centroSaludId === filtroCentro;
      const matchPlanta = filtroPlanta === 'TODOS' || t.planta === filtroPlanta;
      return matchCentro && matchPlanta;
    });
  }, [turnos, hoyStr, filtroCentro, filtroPlanta]);

  // Columnas operativas según HU-55:
  // 1. 'Por Llegar': PENDIENTE o CONFIRMADO
  // 2. 'En Espera': EN_SALA_DE_ESPERA o EN_ESPERA
  // 3. 'En Consulta': ATENDIENDO
  // 4. 'Atendidos': COMPLETADO
  const porLlegar = turnosFiltrados.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
  );
  const enEspera = turnosFiltrados.filter(
    (t) => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA'
  );
  const enConsulta = turnosFiltrados.filter((t) => t.estado === 'ATENDIENDO');
  const atendidos = turnosFiltrados.filter((t) => t.estado === 'COMPLETADO');

  // Mover a En Espera (Check-In)
  const handleMoverAEnEspera = async (turno: Turno) => {
    const updated = await turnosService.checkIn(turno.id);
    if (updated) {
      setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
    }
  };

  // Llamar a Consultorio (En Consulta) y emitir audio chime
  const handleLlamarAConsultorio = async (turno: Turno) => {
    soundNotification.playChime();
    const updated = await turnosService.llamarPaciente(
      turno.id,
      turno.consultorioNumero || consultorioSeleccionado
    );
    if (updated) {
      setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
    }
  };

  // Finalizar Consulta (Atendido)
  const handleFinalizar = async (turno: Turno) => {
    const updated = await turnosService.updateEstado(turno.id, 'COMPLETADO');
    if (updated) {
      setTurnos((prev) => prev.map((t) => (t.id === turno.id ? updated : t)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Kanban */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tablero Kanban de Salas de Espera
          </h1>
          <p className="text-xs text-muted-foreground">
            Control de flujo de pacientes en tiempo real: de recepción a consultorio y salida.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => soundNotification.playChime()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
            title="Probar sonido de llamado"
          >
            <Volume2 className="h-4 w-4 text-primary" />
            <span>Probar Sonido</span>
          </button>

          <Link
            to="/pantalla-turnos"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            <MonitorPlay className="h-4 w-4" />
            <span>Abrir Modo TV / Tótem</span>
          </Link>
        </div>
      </div>

      {/* Segmentación en tiempo real por Centro y Planta */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <select
              value={filtroCentro}
              onChange={(e) => setFiltroCentro(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="TODOS">Todas las Sedes / Centros</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Planta / Piso:</span>
            <select
              value={filtroPlanta}
              onChange={(e) => setFiltroPlanta(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="TODOS">Todas las Plantas</option>
              <option value="Planta Baja">Planta Baja</option>
              <option value="1° Piso">1° Piso</option>
              <option value="2° Piso">2° Piso</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Consultorio para llamado rápido:</span>
          <select
            value={consultorioSeleccionado}
            onChange={(e) => setConsultorioSeleccionado(e.target.value)}
            className="rounded-xl border border-input bg-background px-2.5 py-1 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="101">101</option>
            <option value="102">102</option>
            <option value="105">105</option>
            <option value="204">204</option>
            <option value="301">301</option>
          </select>
        </div>
      </div>

      {/* Columnas Kanban */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* COLUMNA 1: Por Llegar */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Por Llegar</h3>
              </div>
              <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                {porLlegar.length}
              </span>
            </div>

            <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
              {porLlegar.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 hover:border-sky-500/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-sky-700">{t.hora} hs</span>
                    {t.esPrimeraVez && (
                      <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        1ª Vez
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.pacienteNombre}</h4>
                    <p className="text-[11px] text-muted-foreground">DNI <span className="font-mono">{t.pacienteDni}</span></p>
                  </div>
                  <div className="pt-2 border-t border-border text-[11px] text-muted-foreground flex justify-between">
                    <span>{t.profesionalNombre}</span>
                    <span className="font-mono font-semibold">Cons. {t.consultorioNumero || '102'}</span>
                  </div>
                  <button
                    onClick={() => handleMoverAEnEspera(t)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 text-xs transition"
                  >
                    <span>Marcar Llegada</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {porLlegar.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 italic">No hay pacientes por llegar</p>
              )}
            </div>
          </div>

          {/* COLUMNA 2: En Sala de Espera */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-700">En Espera</h3>
              </div>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                {enEspera.length}
              </span>
            </div>

            <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
              {enEspera.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 hover:border-amber-500/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-700">{t.hora} hs</span>
                    <span className="text-[10px] text-muted-foreground">
                      Llegó: <span className="font-mono">{t.horaCheckIn || 'En sala'}</span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.pacienteNombre}</h4>
                    <p className="text-[11px] text-muted-foreground">{t.obraSocial || 'Particular'}</p>
                  </div>
                  <div className="pt-2 border-t border-border text-[11px] text-muted-foreground flex justify-between">
                    <span>{t.profesionalNombre}</span>
                    <span className="font-mono font-semibold text-foreground">Cons. {t.consultorioNumero || '102'}</span>
                  </div>
                  <button
                    onClick={() => handleLlamarAConsultorio(t)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold py-1.5 text-xs transition shadow-xs"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Llamar a Consultorio</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {enEspera.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 italic">Sala de espera despejada</p>
              )}
            </div>
          </div>

          {/* COLUMNA 3: En Consulta */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-sky-700">En Consulta</h3>
              </div>
              <span className="rounded-full bg-sky-700 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                {enConsulta.length}
              </span>
            </div>

            <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
              {enConsulta.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-sky-600 bg-card p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white">En atención</span>
                    <span className="text-[10px] text-muted-foreground">
                      Llamado: <span className="font-mono">{t.horaLlamado || '09:00'}</span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.pacienteNombre}</h4>
                    <p className="text-[11px] font-semibold text-sky-700 font-mono">Consultorio {t.consultorioNumero || '102'}</p>
                  </div>
                  <div className="pt-2 border-t border-border text-[11px] text-muted-foreground">
                    Atendido por: <strong className="text-foreground">{t.profesionalNombre}</strong>
                  </div>
                  <button
                    onClick={() => handleFinalizar(t)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 text-xs transition shadow-xs"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Finalizar Atención</span>
                  </button>
                </div>
              ))}
              {enConsulta.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 italic">Ningún consultorio ocupado actualmente</p>
              )}
            </div>
          </div>

          {/* COLUMNA 4: Atendidos */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700">Atendidos</h3>
              </div>
              <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                {atendidos.length}
              </span>
            </div>

            <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
              {atendidos.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-1.5 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{t.pacienteNombre}</h4>
                    <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">Completado</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.especialidadNombre}</p>
                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                    Dr(a). {t.profesionalNombre}
                  </div>
                </div>
              ))}
              {atendidos.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 italic">Sin pacientes atendidos aún hoy</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
