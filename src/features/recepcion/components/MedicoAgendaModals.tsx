import React from 'react';
import type { ConsultorioItem } from '@/api/centrosService';
import type { DisponibilidadRequest, BloqueoRequest } from '@/types';
import { ModalCrearDisponibilidad } from './ModalCrearDisponibilidad';
import { ModalCrearBloqueo } from './ModalCrearBloqueo';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';

interface MedicoAgendaModalsProps {
  medicoId: string;
  activeCentroId: string;
  consultorios: ConsultorioItem[];
  isModalDispOpen: boolean;
  onCloseModalDisp: () => void;
  onConfirmDisp: (data: DisponibilidadRequest) => Promise<boolean>;
  isModalBloqueoOpen: boolean;
  onCloseModalBloqueo: () => void;
  onConfirmBloqueo: (data: BloqueoRequest) => Promise<boolean>;
  dispToDelete: string | null;
  onCloseDeleteDisp: () => void;
  onConfirmDeleteDisp: () => Promise<void>;
  isDeletingDisp: boolean;
  bloqueoToDelete: string | null;
  onCloseDeleteBloqueo: () => void;
  onConfirmDeleteBloqueo: () => Promise<void>;
  isDeletingBloqueo: boolean;
}

export const MedicoAgendaModals: React.FC<MedicoAgendaModalsProps> = ({
  medicoId,
  activeCentroId,
  consultorios,
  isModalDispOpen,
  onCloseModalDisp,
  onConfirmDisp,
  isModalBloqueoOpen,
  onCloseModalBloqueo,
  onConfirmBloqueo,
  dispToDelete,
  onCloseDeleteDisp,
  onConfirmDeleteDisp,
  isDeletingDisp,
  bloqueoToDelete,
  onCloseDeleteBloqueo,
  onConfirmDeleteBloqueo,
  isDeletingBloqueo,
}) => {
  return (
    <>
      <ModalCrearDisponibilidad
        isOpen={isModalDispOpen}
        onClose={onCloseModalDisp}
        onConfirm={onConfirmDisp}
        profesionalId={medicoId}
        activeCentroId={activeCentroId}
        consultorios={consultorios}
      />
      <ModalCrearBloqueo
        isOpen={isModalBloqueoOpen}
        onClose={onCloseModalBloqueo}
        onConfirm={onConfirmBloqueo}
        profesionalId={medicoId}
      />
      <ModalConfirmacion
        isOpen={Boolean(dispToDelete)}
        onClose={onCloseDeleteDisp}
        onConfirm={onConfirmDeleteDisp}
        title="Eliminar franja horaria"
        description="¿Confirmás eliminar esta disponibilidad de atención? No afectará a turnos ya reservados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingDisp}
      />
      <ModalConfirmacion
        isOpen={Boolean(bloqueoToDelete)}
        onClose={onCloseDeleteBloqueo}
        onConfirm={onConfirmDeleteBloqueo}
        title="Eliminar bloqueo de agenda"
        description="¿Confirmás remover este bloqueo de agenda para habilitar la fecha nuevamente?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingBloqueo}
      />
    </>
  );
};
