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
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll lock obligatorio (SSOT 7.2)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus en el botón de confirmación para accesibilidad WCAG
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertTriangle className="h-6 w-6 text-rose-600" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-600" />,
    primary: <Info className="h-6 w-6 text-sky-600" />,
  };

  const buttonStyleMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    primary: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            {iconMap[variant]}
          </div>
          <div className="space-y-1 pr-6">
            <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900">
              {title}
            </h3>
            <p id="confirm-modal-description" className="text-xs text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${buttonStyleMap[variant]}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
