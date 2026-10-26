import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/authService';
import { Clock, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_WARNING_MS = 12 * 60 * 1000; // 12 minutos (DoD HU-44)
const INACTIVITY_LOGOUT_MS = 15 * 60 * 1000;  // 15 minutos (DoD HU-44)

export const ActivityMonitor: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutos de gracia
  const lastActivityRef = useRef<number>(0);
  const timerCheckRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  }, []);

  // Escuchar interacciones del usuario en la ventana
  useEffect(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();
    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    const handleUserActivity = () => {
      // Si el modal de advertencia ya está visible, no resetear automáticamente por un simple mousemove
      // para obligar al usuario a hacer clic explícito en 'Extender Sesión'
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, showWarning]);

  // Intervalo de chequeo de inactividad
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    timerCheckRef.current = setInterval(() => {
      const now = Date.now();
      const inactiveDuration = now - lastActivityRef.current;

      if (inactiveDuration >= INACTIVITY_LOGOUT_MS) {
        // Cierre forzoso a los 15 minutos exactos de inactividad (HU-44)
        setShowWarning(false);
        logout();
        navigate('/login?reason=inactivity');
      } else if (inactiveDuration >= INACTIVITY_WARNING_MS) {
        // Advertencia a los 12 minutos de inactividad (HU-44)
        setShowWarning(true);
        const remaining = Math.max(0, Math.floor((INACTIVITY_LOGOUT_MS - inactiveDuration) / 1000));
        setSecondsRemaining(remaining);
      } else {
        if (showWarning) setShowWarning(false);
      }
    }, 1000);

    return () => {
      if (timerCheckRef.current) clearInterval(timerCheckRef.current);
    };
  }, [isAuthenticated, logout, navigate, showWarning]);

  const handleExtendSession = async () => {
    try {
      await authService.refreshSession();
    } finally {
      resetActivity();
    }
  };

  const handleManualLogout = async () => {
    setShowWarning(false);
    await logout();
    navigate('/login');
  };

  if (!showWarning || !isAuthenticated) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-amber-300 bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold font-heading text-foreground">
            Aviso de Inactividad de Sesión
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Por estrictas normas de seguridad médica, no se detectó actividad durante los últimos 12 minutos.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-1">
          <p className="text-xs font-semibold text-amber-900">
            Tu sesión se cerrará automáticamente en:
          </p>
          <div className="font-mono text-3xl font-extrabold text-amber-700 tracking-wider">
            {formattedTime}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={handleManualLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            type="button"
            onClick={handleExtendSession}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Extender Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
