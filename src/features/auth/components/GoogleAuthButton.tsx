import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

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
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.warn('No se pudo cargar la librería de Google Identity Services.');
      };
      document.head.appendChild(script);
    }
  }, []);

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

  const handleButtonClick = () => {
    if (isLoading || disabled) return;

    if (!clientId) {
      onError?.(
        'La autenticación con Google requiere configurar VITE_GOOGLE_CLIENT_ID en las variables de entorno.'
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      onError?.('El servicio de Google aún se está cargando. Por favor reintente en unos instantes.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const tempContainer = document.createElement('div');
          tempContainer.style.display = 'none';
          document.body.appendChild(tempContainer);
          window.google?.accounts?.id?.renderButton(tempContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
          });
          const buttonElement = tempContainer.querySelector('div[role=button]') as HTMLElement;
          if (buttonElement) {
            buttonElement.click();
          }
          setTimeout(() => {
            if (document.body.contains(tempContainer)) {
              document.body.removeChild(tempContainer);
            }
          }, 1000);
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al inicializar Google Sign-In.';
      onError?.(message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition text-xs font-bold text-slate-700 shadow-xs disabled:opacity-50 cursor-pointer ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
      ) : (
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
      )}
      <span>
        {isLoading
          ? 'Conectando con Google...'
          : mode === 'signup'
          ? 'Registrarse con Google'
          : 'Continuar con Google'}
      </span>
    </button>
  );
};
