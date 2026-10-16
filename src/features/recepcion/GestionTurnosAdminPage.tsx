import React, { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';
import { Search, Calendar, Clock, RotateCcw, XCircle, X } from 'lucide-react';

export const GestionTurnosAdminPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // HU-27: Estado para modal de Reagendamiento
  const [turnoAReagendar, setTurnoAReagendar] = useState<Turno | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);

  useEffect(() => {
    turnosService.getAll().then(setTurnos);
  }, []);

  const handleConfirmarCancelacion = async () => {
    if (!turnoACancelar) return;
    await turnosService.cancelarTurno(turnoACancelar.id);
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoACancelar.id ? { ...t, estado: 'CANCELADO' } : t))
    );
    setTurnoACancelar(null);
  };

  // HU-27: Reagendamiento de cita
  const handleConfirmarReagendamiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnoAReagendar || !nuevaFecha || !nuevaHora) return;

    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoAReagendar.id
          ? { ...t, fecha: nuevaFecha, hora: nuevaHora, estado: 'CONFIRMADO' }
          : t
      )
    );
    setTurnoAReagendar(null);
    setNuevaFecha('');
    setNuevaHora('');
  };

  // HU-29: Filtro Avanzado de Turnos por Estado, Rango de Fecha y Buscador
  const turnosFiltrados = turnos.filter((t) => {
    const matchTexto =
      t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.profesionalNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.centroSaludNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.codigoVerificacion.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado;

    const matchFechaDesde = !fechaDesde || t.fecha >= fechaDesde;
    const matchFechaHasta = !fechaHasta || t.fecha <= fechaHasta;

    return matchTexto && matchEstado && matchFechaDesde && matchFechaHasta;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gestión Central de Turnos
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Supervisión global, reprogramación (reagendamiento) y cancelaciones administrativas.
        </p>
      </div>

      {/* HU-29: Panel de Filtros Avanzados (Texto + Estado + Rango de Fechas) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filtrar por Paciente, Médico, Centro de Salud o Código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-xs">
          {/* Filtro por Estado */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Estado del Turno:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-medium"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="CONFIRMADO">CONFIRMADO</option>
              <option value="EN_ESPERA">EN SALA DE ESPERA</option>
              <option value="ATENDIENDO">EN CONSULTA</option>
              <option value="COMPLETADO">ATENDIDO (COMPLETADO)</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>

          {/* Rango de Fechas - Desde */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Fecha Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono"
            />
          </div>

          {/* Rango de Fechas - Hasta */}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Fecha Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono"
            />
          </div>

          {/* Reset Filtros */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('TODOS');
                setFechaDesde('');
                setFechaHasta('');
              }}
              className="w-full rounded-lg border border-input bg-muted/40 py-1.5 font-medium hover:bg-accent transition text-muted-foreground cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Turnos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Código</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Profesional</th>
                <th className="p-4">Centro</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {turnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No se encontraron turnos con los criterios de filtro especificados.
                  </td>
                </tr>
              ) : (
                turnosFiltrados.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{t.fecha}</span>
                        <span className="text-muted-foreground font-mono">({t.hora} hs)</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-primary font-bold">{t.codigoVerificacion}</td>
                    <td className="p-4 font-medium text-foreground">{t.pacienteNombre}</td>
                    <td className="p-4">{t.profesionalNombre}</td>
                    <td className="p-4 text-muted-foreground">{t.centroSaludNombre}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 font-bold text-[10px] text-white shadow-xs ${
                          t.estado === 'CONFIRMADO'
                            ? 'bg-emerald-700'
                            : t.estado === 'EN_ESPERA'
                            ? 'bg-amber-600'
                            : t.estado === 'ATENDIENDO'
                            ? 'bg-sky-700'
                            : t.estado === 'CANCELADO'
                            ? 'bg-rose-700'
                            : 'bg-slate-700'
                        }`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* HU-27: Botón Reagendar */}
                        {t.estado !== 'CANCELADO' && t.estado !== 'COMPLETADO' && (
                          <button
                            type="button"
                            onClick={() => {
                              setTurnoAReagendar(t);
                              setNuevaFecha(t.fecha);
                              setNuevaHora(t.hora);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-foreground hover:bg-accent transition cursor-pointer"
                            title="Reagendar turno"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-primary" />
                            <span>Reagendar</span>
                          </button>
                        )}

                        {/* Cancelar Administrativamente */}
                        {t.estado !== 'CANCELADO' && (
                          <button
                            type="button"
                            onClick={() => setTurnoACancelar(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-700 font-semibold hover:bg-rose-700 hover:text-white dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200 transition cursor-pointer"
                            title="Cancelar cita"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HU-27: Modal de Reagendamiento */}
      {turnoAReagendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground font-heading">
                  Reagendar Cita Médica
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTurnoAReagendar(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-muted/40 p-3.5 text-xs space-y-1">
              <div><strong className="text-foreground">Paciente:</strong> {turnoAReagendar.pacienteNombre}</div>
              <div><strong className="text-foreground">Profesional:</strong> {turnoAReagendar.profesionalNombre}</div>
              <div><strong className="text-foreground">Código de Turno:</strong> {turnoAReagendar.codigoVerificacion}</div>
            </div>

            <form onSubmit={handleConfirmarReagendamiento} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Nueva Fecha</span>
                </label>
                <input
                  type="date"
                  required
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Nuevo Horario</span>
                </label>
                <select
                  required
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
                >
                  <option value="08:00">08:00 hs</option>
                  <option value="08:30">08:30 hs</option>
                  <option value="09:00">09:00 hs</option>
                  <option value="09:30">09:30 hs</option>
                  <option value="10:00">10:00 hs</option>
                  <option value="10:30">10:30 hs</option>
                  <option value="11:00">11:00 hs</option>
                  <option value="11:30">11:30 hs</option>
                  <option value="16:00">16:00 hs</option>
                  <option value="16:30">16:30 hs</option>
                  <option value="17:00">17:00 hs</option>
                  <option value="17:30">17:30 hs</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTurnoAReagendar(null)}
                  className="flex-1 rounded-xl border border-input py-2.5 font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
                >
                  Confirmar Reprogramación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Accesible de Cancelación Administrativa */}
      {turnoACancelar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/70">
                <XCircle className="h-6 w-6 text-rose-700 dark:text-rose-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Cancelar Turno Administrativamente</h3>
                <p className="text-xs text-muted-foreground">Esta acción anulará la reserva en el sistema.</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border border-border/60">
              <div><strong className="text-foreground">Paciente:</strong> {turnoACancelar.pacienteNombre}</div>
              <div><strong className="text-foreground">Médico:</strong> {turnoACancelar.profesionalNombre}</div>
              <div><strong className="text-foreground">Fecha y Hora:</strong> {turnoACancelar.fecha} ({turnoACancelar.hora} hs)</div>
              <div><strong className="text-foreground">Centro:</strong> {turnoACancelar.centroSaludNombre}</div>
            </div>

            <p className="text-xs text-muted-foreground">
              ¿Desea confirmar la cancelación administrativa de este turno?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTurnoACancelar(null)}
                className="flex-1 rounded-lg border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelacion}
                className="flex-1 rounded-lg bg-rose-700 py-2 text-xs font-bold text-white hover:bg-rose-800 transition cursor-pointer shadow-sm"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
