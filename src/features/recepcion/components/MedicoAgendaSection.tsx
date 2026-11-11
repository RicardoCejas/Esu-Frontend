import React from 'react';
import { Clock, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { BloqueoAgenda, DisponibilidadProfesional, Turno } from '@/types';
import { useMedicoAgenda } from '../hooks/useMedicoAgenda';
import { MedicoProximosTurnosList } from './MedicoProximosTurnosList';
import { MedicoBloqueosList } from './MedicoBloqueosList';
import { MedicoAgendaModals } from './MedicoAgendaModals';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', THURSDAY: 'Jueves',
  FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
};

interface MedicoAgendaSectionProps {
  medicoId: string;
  disponibilidades: DisponibilidadProfesional[];
  bloqueos: BloqueoAgenda[];
  proximosTurnos: Turno[];
  activeCentroId: string;
  onReload: () => Promise<void>;
  canEdit?: boolean;
}

export const MedicoAgendaSection: React.FC<MedicoAgendaSectionProps> = ({
  medicoId, disponibilidades, bloqueos, proximosTurnos, activeCentroId, onReload, canEdit = true,
}) => {
  const agenda = useMedicoAgenda(medicoId, activeCentroId, onReload);
  const filteredDisp = activeCentroId
    ? disponibilidades.filter((d) => String(d.centroSaludId) === String(activeCentroId))
    : disponibilidades;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Clock className="h-4 w-4 text-sky-700" />
              <span>Grilla Horaria en esta Sede</span>
            </h2>
            <p className="text-xs text-muted-foreground">Configuración de días, franjas y consultorios habituales de atención.</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={agenda.handleGenerarSlots}
                disabled={agenda.isGeneratingSlots}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-lg text-xs font-semibold text-foreground hover:bg-muted cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${agenda.isGeneratingSlots ? 'animate-spin' : ''}`} />
                <span>Regenerar Cupos</span>
              </button>
              <button
                type="button"
                onClick={() => agenda.setIsModalDispOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nueva Franja</span>
              </button>
            </div>
          )}
        </div>

        {filteredDisp.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">No hay franjas de disponibilidad configuradas para este centro de salud.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDisp.map((slot) => (
              <div key={slot.id} className="rounded-lg border border-border bg-background p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{DAY_LABELS[slot.diaSemana.toUpperCase()] ?? slot.diaSemana}</span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => agenda.setDispToDelete(slot.id)}
                      className="p-1 text-muted-foreground hover:text-rose-700 rounded transition cursor-pointer"
                      title="Eliminar franja"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="font-semibold text-sky-700 tabular-nums">{slot.horaInicio.slice(0, 5)} a {slot.horaFin.slice(0, 5)} hs</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                  <span>Turnos cada {slot.intervaloMinutos} min</span>
                  <span className="font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {slot.consultorioNumero ? `Cons. ${slot.consultorioNumero}` : 'Sin consultorio'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MedicoBloqueosList
          bloqueos={bloqueos}
          canEdit={canEdit}
          onOpenModal={() => agenda.setIsModalBloqueoOpen(true)}
          onSelectDelete={agenda.setBloqueoToDelete}
        />
        <MedicoProximosTurnosList turnos={proximosTurnos} />
      </div>

      <MedicoAgendaModals
        medicoId={medicoId}
        activeCentroId={activeCentroId}
        consultorios={agenda.consultorios}
        isModalDispOpen={agenda.isModalDispOpen}
        onCloseModalDisp={() => agenda.setIsModalDispOpen(false)}
        onConfirmDisp={agenda.handleCrearDisponibilidad}
        isModalBloqueoOpen={agenda.isModalBloqueoOpen}
        onCloseModalBloqueo={() => agenda.setIsModalBloqueoOpen(false)}
        onConfirmBloqueo={agenda.handleCrearBloqueo}
        dispToDelete={agenda.dispToDelete}
        onCloseDeleteDisp={() => agenda.setDispToDelete(null)}
        onConfirmDeleteDisp={async () => {
          if (agenda.dispToDelete) await agenda.handleEliminarDisponibilidad(agenda.dispToDelete);
        }}
        isDeletingDisp={agenda.isDeletingDisp}
        bloqueoToDelete={agenda.bloqueoToDelete}
        onCloseDeleteBloqueo={() => agenda.setBloqueoToDelete(null)}
        onConfirmDeleteBloqueo={async () => {
          if (agenda.bloqueoToDelete) await agenda.handleEliminarBloqueo(agenda.bloqueoToDelete);
        }}
        isDeletingBloqueo={agenda.isDeletingBloqueo}
      />
    </div>
  );
};
