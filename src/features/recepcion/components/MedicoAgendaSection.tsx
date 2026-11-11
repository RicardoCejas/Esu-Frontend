import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { BloqueoAgenda, DisponibilidadProfesional, Turno } from '@/types';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', THURSDAY: 'Jueves',
  FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves',
  VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
};

interface MedicoAgendaSectionProps {
  disponibilidades: DisponibilidadProfesional[];
  bloqueos: BloqueoAgenda[];
  proximosTurnos: Turno[];
  activeCentroId: string;
}

export const MedicoAgendaSection: React.FC<MedicoAgendaSectionProps> = ({
  disponibilidades,
  bloqueos,
  proximosTurnos,
  activeCentroId,
}) => {
  const filteredDisp = activeCentroId
    ? disponibilidades.filter((d) => String(d.centroSaludId) === String(activeCentroId))
    : disponibilidades;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Clock className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Grilla Horaria en esta Sede
          </h2>
          <p className="text-xs text-muted-foreground">
            Visualización de solo lectura. La edición de franjas horarias corresponde al médico o administrador.
          </p>
        </div>

        {filteredDisp.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No hay franjas de disponibilidad configuradas para este centro de salud.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDisp.map((slot) => (
              <div
                key={slot.id}
                className="rounded-lg border border-border bg-background p-3.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">
                    {DAY_LABELS[slot.diaSemana.toUpperCase()] ?? slot.diaSemana}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                      slot.activo !== false ? 'bg-emerald-700' : 'bg-slate-600'
                    }`}
                  >
                    {slot.activo !== false ? 'Habilitada' : 'Pausada'}
                  </span>
                </div>
                <p className="font-semibold text-sky-700 tabular-nums">
                  {slot.horaInicio.slice(0, 5)} a {slot.horaFin.slice(0, 5)} hs
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Turnos cada {slot.intervaloMinutos} min
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            Bloqueos y Licencias Registrados ({bloqueos.length})
          </h2>

          {bloqueos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              Sin ausencias o bloqueos de agenda vigentes.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bloqueos.map((b) => (
                <li
                  key={b.id}
                  className="rounded-lg border border-border bg-background p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">{b.motivo}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {b.fechaInicio} → {b.fechaFin}
                    </span>
                  </div>
                  {(b.horaInicio || b.horaFin) && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      Franja: {b.horaInicio || '00:00'} - {b.horaFin || '23:59'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-2.5">
            <Calendar className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Próximos Turnos en esta Sede ({proximosTurnos.length})
          </h2>

          {proximosTurnos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No se registran turnos activos próximos para este profesional en la sede.
            </p>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {proximosTurnos.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{t.pacienteNombre}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {t.fecha} · {t.hora} hs ({t.estado})
                    </p>
                  </div>
                  <Link
                    to={`/dashboard/recepcion/turnos/${t.id}/reagendar`}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-muted transition shrink-0"
                  >
                    Reagendar
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
