/**
 * Gestor de bandera de presencia de sesión multi-pestaña.
 * Permite que nuevas pestañas detecten una sesión activa preexistente
 * y disparen la hidratación silenciosa vía cookie HttpOnly (refresh token)
 * sin forzar un falso redirect a /login.
 * 
 * Nota de seguridad: Este mecanismo NO almacena tokens, contraseñas ni
 * datos sensibles; únicamente actúa como indicador booleano de sesión activa.
 */

const SESSION_FLAG_KEY = 'esu_session_active';

export const authSessionStorage = {
  isSessionActive(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(
        window.localStorage.getItem(SESSION_FLAG_KEY) ||
        window.sessionStorage.getItem(SESSION_FLAG_KEY)
      );
    } catch {
      return false;
    }
  },

  setSessionActive(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SESSION_FLAG_KEY, '1');
      window.sessionStorage.setItem(SESSION_FLAG_KEY, '1');
    } catch {
      // Ignorar fallos de cuota o modo incógnito restrictivo
    }
  },

  clearSessionActive(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SESSION_FLAG_KEY);
      window.sessionStorage.removeItem(SESSION_FLAG_KEY);
    } catch {
      // Ignorar fallos de acceso a storage
    }
  },
};
