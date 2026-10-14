import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, description?: string) => {
    toast({ type: 'success', title, description });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ type: 'error', title, description });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ type: 'info', title, description });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    toast({ type: 'warning', title, description });
  }, [toast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-sky-600 shrink-0" />;
    }
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white/95 text-slate-800 shadow-emerald-500/10 dark:bg-slate-900 dark:border-emerald-800 dark:text-slate-100';
      case 'error':
        return 'border-rose-200 bg-white/95 text-slate-800 shadow-rose-500/10 dark:bg-slate-900 dark:border-rose-800 dark:text-slate-100';
      case 'warning':
        return 'border-amber-200 bg-white/95 text-slate-800 shadow-amber-500/10 dark:bg-slate-900 dark:border-amber-800 dark:text-slate-100';
      case 'info':
      default:
        return 'border-sky-200 bg-white/95 text-slate-800 shadow-sky-500/10 dark:bg-slate-900 dark:border-sky-800 dark:text-slate-100';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-300 ${getToastStyle(
              t.type
            )}`}
          >
            {getToastIcon(t.type)}
            <div className="flex-1 text-xs">
              <p className="font-bold font-heading">{t.title}</p>
              {t.description && <p className="text-muted-foreground mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition cursor-pointer p-0.5"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};
