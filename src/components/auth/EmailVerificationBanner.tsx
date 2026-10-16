import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/authService';
import { AlertCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Solo mostrar si el usuario está autenticado y su email no está verificado (HU-43)
  if (!user || user.emailVerified !== false) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authService.resendVerificationEmail(user.email);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-500 text-amber-950 border-b border-amber-600/30 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-900 shrink-0" />
          <p className="font-medium">
            <span className="font-bold">Acceso restringido:</span> Tu cuenta aún no tiene confirmado el correo electrónico (<strong>{user.email}</strong>). Algunas funciones clínicas y reservas están limitadas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sentSuccess ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-amber-400/60 px-3 py-1 rounded-full text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
              ¡Enlace reenviado!
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 font-bold bg-amber-900 text-white px-3 py-1 rounded-full hover:bg-amber-950 transition disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              <span>Reenviar correo</span>
            </button>
          )}

          <Link
            to="/verificar-email"
            className="font-bold text-amber-950 underline hover:text-black"
          >
            Ver estado
          </Link>
        </div>
      </div>
    </div>
  );
};
