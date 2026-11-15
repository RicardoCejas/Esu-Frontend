import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      const targetFocus =
        variant === 'danger' ? cancelButtonRef.current : confirmButtonRef.current;
      targetFocus?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, variant]);

  const iconMap = {
    danger: <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    primary: <Info className="h-6 w-6 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />,
  };

  const buttonStyleMap = {
    danger: 'bg-rose-700 hover:bg-rose-800 text-white focus-visible:ring-rose-600',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500',
    primary: 'bg-sky-600 hover:bg-sky-700 text-white focus-visible:ring-sky-500',
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      closedby={isLoading ? 'none' : 'closerequest'}
      onCancel={(e) => {
        if (isLoading) {
          e.preventDefault();
          return;
        }
        onClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
      className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95"
    >
      <div className="relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-0 top-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          aria-label="Cerrar diálogo de confirmación"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <div className="pt-0.5">{iconMap[variant]}</div>
          <div className="space-y-1.5">
            <h2 id="confirm-modal-title" className="text-base font-bold text-foreground">
              {title}
            </h2>
            <p id="confirm-modal-description" className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-[38px] rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-h-[38px] rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${buttonStyleMap[variant]}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
};
