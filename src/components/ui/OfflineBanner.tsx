import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md animate-in slide-in-from-top duration-300"
      >
        <Wifi className="h-4 w-4" aria-hidden="true" />
        <span>Conexión restablecida. El sistema ESU está sincronizado.</span>
      </aside>
    );
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md animate-in slide-in-from-top duration-300"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Sin conexión a internet. Verifique su red para continuar agendando turnos en Cruz del Eje.
      </span>
    </aside>
  );
};
