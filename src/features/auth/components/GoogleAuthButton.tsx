import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { Loader2, Sparkles, X, Mail, AlertCircle } from 'lucide-react';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess?: (user: User) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle';
              width?: number | string;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = 'signin',
  onSuccess,
  onError,
  className = '',
  disabled = false,
}) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devEmail, setDevEmail] = useState('paciente.nuevo@gmail.com');
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isDev = Boolean(import.meta.env.DEV);

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response.credential) {
      onError?.('No se recibió la credencial de autenticación de Google.');
      return;
    }

    setIsLoading(true);
    try {
      const authData = await loginWithGoogle(response.credential);
      onSuccess?.(authData.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al autenticarse con Google.';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: googleBtnContainerRef.current.parentElement?.clientWidth || 320,
          logo_alignment: 'left',
        });
      } catch (err) {
        console.warn('Error al inicializar el botón de Google:', err);
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.getElementById('google-gsi-client') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
    }
  }, [clientId, mode]);

  const handleSimularLoginGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDevModal(false);
    const emailToUse = (devEmail || 'paciente.nuevo@gmail.com').trim().toLowerCase();
    handleCredentialResponse({
      credential: `dev-google-token:${emailToUse}`,
    });
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
          <span>Autenticando con Google...</span>
        </div>
      ) : !clientId ? (
        <button
          type="button"
          onClick={() => {
            if (isDev) {
              setShowDevModal(true);
            } else {
              onError?.('La autenticación con Google requiere configurar VITE_GOOGLE_CLIENT_ID en las variables de entorno.');
            }
          }}
          disabled={disabled || isLoading}
          className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition text-xs font-bold text-slate-700 shadow-xs disabled:opacity-50 cursor-pointer ${className}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {mode === 'signup' ? 'Registrarse con Google' : 'Continuar con Google'}
          </span>
        </button>
      ) : (
        <div className="w-full flex justify-center overflow-hidden rounded-xl">
          <div
            ref={googleBtnContainerRef}
            className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full [&_iframe]:!min-w-full"
          />
        </div>
      )}

      {/* Modal interactivo de Google Sign-In para desarrollo local */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-sky-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Iniciar / Crear cuenta con Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDevModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              En entorno local podés ingresar cualquier correo para registrar o iniciar sesión como <strong>Paciente</strong> en el sistema:
            </p>

            <form onSubmit={handleSimularLoginGoogle} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Correo electrónico de Google
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="ej: mi.paciente@gmail.com"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition"
                >
                  Continuar
                </button>
              </div>
            </form>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-800 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                <span>¿Querés usar la ventana emergente real de Google?</span>
              </div>
              <p>
                Configurá <code className="font-semibold bg-white px-1 py-0.5 rounded border border-amber-200">VITE_GOOGLE_CLIENT_ID</code> en tu archivo <code className="font-semibold bg-white px-1 py-0.5 rounded border border-amber-200">.env</code> con las credenciales de Google Cloud Console.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
