import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Calendar, Clock, RotateCcw, FileText } from 'lucide-react';
import { useReagendarTurno } from './hooks/useReagendarTurno';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export const ReagendarTurnoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    hoy,
    turno,
    disponibilidades,
    bloqueos,
    bloqueoActivo,
    isBlockedState,
    nuevaFecha,
    setNuevaFecha,
    nuevaHora,
    setNuevaHora,
    horaManual,
    setHoraManual,
    motivo,
    setMotivo,
    slotsDisponibles,
    loadingSlots,
    loading,
    saving,
    loadError,
    submitError,
    returnTo,
    loadTurno,
    handleConfirm,
  } = useReagendarTurno(id);

  const backUrl =
    returnTo === 'paciente' && turno?.pacienteId
      ? `/dashboard/recepcion/pacientes/${turno.pacienteId}`
      : '/dashboard/recepcion/turnos';

  const backLabel = returnTo === 'paciente' ? 'Volver a Ficha del Paciente' : 'Volver a Gestión de Turnos';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  if (loadError || !turno) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'No se pudo cargar el turno.'}</p>
          <button
            type="button"
            onClick={() => void loadTurno()}
            className="rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleConfirm();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Reagendar Turno Médico
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultá la agenda real del profesional, verificá bloqueos vigentes y asigná el nuevo horario disponible.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 text-xs grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-semibold text-muted-foreground block">Paciente</span>
          <span className="font-bold text-foreground">{turno.pacienteNombre}</span>
          <span className="block text-muted-foreground tabular-nums">DNI {turno.pacienteDni}</span>
        </div>
        <div>
          <span className="font-semibold text-muted-foreground block">Profesional y Especialidad</span>
          <span className="font-bold text-foreground">{turno.profesionalNombre}</span>
          <span className="block text-muted-foreground">{turno.especialidadNombre}</span>
        </div>
        <div>
          <span className="font-semibold text-muted-foreground block">Fecha y Hora Actual</span>
          <span className="font-bold text-foreground tabular-nums">
            {turno.fecha} · {turno.hora} hs
          </span>
          <span className="block text-muted-foreground">{turno.centroSaludNombre}</span>
        </div>
        <div>
          <span className="font-semibold text-muted-foreground block">Código / Estado</span>
          <span className="font-bold text-foreground tabular-nums">
            {turno.codigoVerificacion || `#${turno.id}`}
          </span>
          <span className="mt-1 inline-block rounded bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white">
            {turno.estado}
          </span>
        </div>
      </section>

      {isBlockedState && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
          Este turno se encuentra en estado <strong>{turno.estado}</strong> y no admite reprogramación administrativa.
        </div>
      )}

      {bloqueoActivo && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-bold block">Alerta: Profesional con Bloqueo de Agenda en esta Fecha</span>
            <span>
              El médico posee un bloqueo registrado ({bloqueoActivo.motivo}) desde el {bloqueoActivo.fechaInicio} hasta el {bloqueoActivo.fechaFin}.
            </span>
          </div>
        </div>
      )}

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={onFormSubmit}
          className="lg:col-span-2 space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs"
        >
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Selección de Nueva Fecha y Horario Real
          </h2>

          <div>
            <label htmlFor="rt-fecha" className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              Nueva Fecha de Atención <span className="text-rose-700">*</span>
            </label>
            <input
              id="rt-fecha"
              type="date"
              min={hoy}
              disabled={isBlockedState || saving}
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            />
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              Horarios Disponibles para el {nuevaFecha}
            </span>

            {loadingSlots ? (
              <p className="text-xs text-muted-foreground py-2">Consultando turnos libres en servidor...</p>
            ) : slotsDisponibles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {slotsDisponibles.map((slot) => {
                  const selected = nuevaHora === slot;
                  return (
                    <label
                      key={slot}
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold tabular-nums cursor-pointer transition ${
                        selected
                          ? 'border-sky-700 bg-sky-700 text-white'
                          : 'border-border bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rt-slot"
                        value={slot}
                        disabled={isBlockedState || saving}
                        checked={selected}
                        onChange={() => {
                          setNuevaHora(slot);
                          setHoraManual('');
                        }}
                        className="sr-only"
                      />
                      {slot} hs
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-4 text-xs">
                <p className="text-muted-foreground">
                  No se encontraron horarios libres automáticos para esa fecha. Podés cambiar de día o indicar un horario administrativo excepcional:
                </p>
                <input
                  id="rt-hora-manual"
                  type="time"
                  disabled={isBlockedState || saving}
                  value={horaManual}
                  onChange={(e) => setHoraManual(e.target.value)}
                  aria-label="Horario manual de reagendamiento"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border">
            <label htmlFor="rt-motivo" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <FileText className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              Motivo u Observación de la Reprogramación (Opcional)
            </label>
            <input
              id="rt-motivo"
              type="text"
              placeholder="Ej: Solicitado por el paciente por imprevisto laboral"
              value={motivo}
              disabled={isBlockedState || saving}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
            <Link
              to={backUrl}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isBlockedState || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Reagendando...' : 'Confirmar Reagendamiento'}
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-xl border border-border bg-card p-5 text-xs">
          <h2 className="font-bold text-foreground border-b border-border pb-2">
            Agenda Habitual y Bloqueos
          </h2>

          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Días de Atención
            </h3>
            {disponibilidades.length === 0 ? (
              <p className="text-muted-foreground italic">Sin grilla fija informada.</p>
            ) : (
              <ul className="space-y-1">
                {disponibilidades.map((d) => (
                  <li key={d.id} className="flex justify-between gap-2 tabular-nums">
                    <span className="font-semibold text-foreground">
                      {DAY_LABELS[d.diaSemana.toUpperCase()] ?? d.diaSemana}
                    </span>
                    <span className="text-muted-foreground">
                      {d.horaInicio.slice(0, 5)} - {d.horaFin.slice(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              Bloqueos Vigentes
            </h3>
            {bloqueos.length === 0 ? (
              <p className="text-muted-foreground italic">Sin bloqueos activos.</p>
            ) : (
              <ul className="space-y-1.5">
                {bloqueos.map((b) => (
                  <li key={b.id} className="rounded border border-border bg-background p-2">
                    <p className="font-semibold text-foreground">{b.motivo}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {b.fechaInicio} → {b.fechaFin}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
