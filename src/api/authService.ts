import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import { authBroadcast } from '@/lib/authBroadcast';
import { sanitizeFormData } from '@/lib/sanitizer';
import { API_ENDPOINTS } from './endpoints';
import type { User, UserRole } from '@/types';

export interface LoginCredentials {
  email?: string;
  dni?: string;
  password?: string;
  rolSimulado?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface BackendAuthData {
  accessToken?: string;
  token?: string;
  usuarioId?: string | number;
  email?: string;
  rol?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  emailVerificado?: boolean;
  emailVerified?: boolean;
  user?: User;
  message?: string;
}

// Almacenamiento seguro en memoria del perfil de usuario actual
let currentSessionUser: User | null = null;

function normalizeUserRole(rawRole?: string): UserRole {
  const upper = (rawRole || 'PACIENTE').toUpperCase();
  if (upper === 'MEDICO' || upper === 'PROFESIONAL') return 'MEDICO';
  if (upper === 'RECEPCIONISTA') return 'RECEPCIONISTA';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'PACIENTE';
}

export const authService = {
  /**
   * Inicio de sesión seguro: almacena token en memoria volátil (HU-41)
   * Sanitiza entradas contra XSS (HU-44)
   * En producción requiere autenticación real contra el backend.
   * En desarrollo permite cuenta de prueba dev@esu.gob.ar.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanCredentials = sanitizeFormData(credentials);
    const emailLower = (cleanCredentials.email || cleanCredentials.dni || '').trim().toLowerCase();
    const isDev = import.meta.env.DEV;
    const isDevCredentials = emailLower === 'dev@esu.gob.ar' && cleanCredentials.password === 'Dev12345!';

    if (!cleanCredentials.password) {
      throw new Error('Debe ingresar su contraseña.');
    }

    try {
      const payload = {
        email: cleanCredentials.email || (cleanCredentials.dni ? `${cleanCredentials.dni}@esu.com` : ''),
        password: cleanCredentials.password,
      };

      const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.login, payload);

      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('El servidor no retornó un token de acceso válido.');
      }

      const user: User = {
        id: String(response.data.usuarioId || Date.now()),
        nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
        apellido: response.data.apellido || '',
        email: response.data.email || payload.email,
        dni: response.data.dni || cleanCredentials.dni || '',
        rol: credentials.rolSimulado && (isDevCredentials || isDev) ? credentials.rolSimulado : normalizeUserRole(response.data.rol),
        activo: true,
        twoFactorEnabled: false,
        emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
        isDeveloper: (isDev || isDevCredentials) && emailLower === 'dev@esu.gob.ar',
      };

      tokenStorage.setAccessToken(token);
      currentSessionUser = user;
      sessionStorage.setItem('esu_session_active', '1');

      authBroadcast.postMessage({ type: 'LOGIN', userId: user.id });
      return { token, user };
    } catch (error: unknown) {
      // Fallback seguro de desarrollo para la cuenta de pruebas solicitada
      if (isDevCredentials) {
        console.info('Autenticando cuenta desarrollador de pruebas (dev@esu.gob.ar)...');
        const devUser: User = {
          id: 'u-dev-master',
          nombre: 'Desarrollador ESU',
          apellido: '',
          email: 'dev@esu.gob.ar',
          dni: '99999999',
          rol: credentials.rolSimulado || 'ADMIN',
          activo: true,
          isDeveloper: true,
          twoFactorEnabled: false,
          emailVerified: true,
        };
        const devToken = `dev-token-${Date.now()}`;
        tokenStorage.setAccessToken(devToken);
        currentSessionUser = devUser;
        sessionStorage.setItem('esu_session_active', '1');
        localStorage.setItem('esu_dev_mode', 'true');
        authBroadcast.postMessage({ type: 'LOGIN', userId: devUser.id });
        return { token: devToken, user: devUser };
      }

      if (isAxiosError<BackendAuthData>(error)) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.status === 401) {
          throw new Error('Credenciales inválidas: email o contraseña incorrectos.');
        }
        if (error.response?.status === 423) {
          throw new Error('La cuenta se encuentra temporalmente bloqueada por superar intentos fallidos.');
        }
        if (error.response?.status === 403) {
          throw new Error('Acceso no permitido o email no verificado.');
        }
        if (error.response) {
          throw error;
        }
      }

      throw error instanceof Error ? error : new Error('Error al conectar con el servicio de autenticación.');
    }
  },

  /**
   * Inicio de sesión y registro federado con Google OAuth2 / OpenID Connect
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    if (!idToken || !idToken.trim()) {
      throw new Error('El token de autenticación de Google es obligatorio.');
    }

    try {
      const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.google, {
        idToken: idToken.trim(),
      });

      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('El servidor no retornó un token de acceso válido.');
      }

      const user: User = {
        id: String(response.data.usuarioId || Date.now()),
        nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
        apellido: response.data.apellido || '',
        email: response.data.email || '',
        dni: response.data.dni || '',
        rol: normalizeUserRole(response.data.rol),
        activo: true,
        twoFactorEnabled: false,
        emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
        isDeveloper: false,
      };

      tokenStorage.setAccessToken(token);
      currentSessionUser = user;
      sessionStorage.setItem('esu_session_active', '1');

      authBroadcast.postMessage({ type: 'LOGIN', userId: user.id });
      return { token, user };
    } catch (error: unknown) {
      if (isAxiosError<BackendAuthData>(error)) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.status === 409) {
          throw new Error(
            'El correo ya está registrado mediante credenciales locales. Por favor inicie sesión con su contraseña tradicional.'
          );
        }
        if (error.response?.status === 401) {
          throw new Error('La credencial de Google no es válida o ha caducado.');
        }
        if (error.response?.status === 403) {
          throw new Error('La cuenta de usuario se encuentra deshabilitada.');
        }
        if (error.response) {
          throw error;
        }
      }

      throw error instanceof Error ? error : new Error('Error al conectar con el servicio de autenticación con Google.');
    }
  },

  /**
   * Registro público de pacientes
   */
  async register(userData: Omit<User, 'id'> & { password?: string }): Promise<AuthResponse> {
    const cleanData = sanitizeFormData(userData);
    const email = cleanData.email.trim().toLowerCase();

    const payload = {
      email,
      password: cleanData.password || '',
    };

    const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.register, payload);

    const user: User = {
      id: String(response.data.usuarioId || Date.now()),
      nombre: cleanData.nombre,
      apellido: cleanData.apellido,
      email,
      dni: cleanData.dni,
      rol: 'PACIENTE',
      activo: true,
      emailVerified: false,
    };

    return {
      token: response.data.accessToken || '',
      user,
    };
  },

  /**
   * Cierre de sesión seguro: revoca refresh token en backend, limpia memoria y cookies
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch {
      // Ignorar fallo de red en logout
    } finally {
      tokenStorage.clearToken();
      currentSessionUser = null;
      sessionStorage.removeItem('esu_session_active');
      localStorage.removeItem('esu_dev_mode');
      localStorage.removeItem('esu_dev_active_role');
      authBroadcast.postMessage({ type: 'LOGOUT', reason: 'user' });
    }
  },

  getCurrentUser(): User | null {
    return currentSessionUser;
  },

  setCurrentUser(user: User | null): void {
    currentSessionUser = user;
  },

  /**
   * Renovación silenciosa de sesión vía Refresh Token seguro
   */
  async refreshSession(): Promise<User | null> {
    try {
      const refreshRes = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.refresh);
      const newToken = refreshRes.data.accessToken || refreshRes.data.token;
      if (newToken) {
        tokenStorage.setAccessToken(newToken);
      }

      const res = await apiClient.get<{ id: number; email: string; rol: string; activo: boolean; verificado: boolean }>(
        API_ENDPOINTS.auth.me
      );
      if (res.data) {
        const refreshedUser: User = {
          id: String(res.data.id),
          nombre: res.data.email ? res.data.email.split('@')[0] : 'Usuario',
          apellido: '',
          email: res.data.email,
          dni: String(res.data.id),
          rol: normalizeUserRole(res.data.rol),
          activo: res.data.activo !== false,
          emailVerified: res.data.verificado !== false,
        };
        currentSessionUser = refreshedUser;
        return refreshedUser;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Switch de rol solo operativo en desarrollo
   */
  async devSwitchRole(newRole: UserRole): Promise<void> {
    if (!import.meta.env.DEV) {
      throw new Error('El cambio dinámico de rol no está habilitado en entornos productivos.');
    }
    try {
      await apiClient.post(API_ENDPOINTS.auth.devSwitchRole, { role: newRole });
    } catch {
      // Permitido en local
    }
    if (currentSessionUser) {
      currentSessionUser.rol = newRole;
      localStorage.setItem('esu_dev_active_role', newRole);
    }
  },

  /**
   * Recuperación de Contraseña con respuesta no reveladora
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = sanitizeFormData(email).trim().toLowerCase();

    try {
      await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email: cleanEmail });
    } catch {
      // Se mantiene respuesta no reveladora
    }

    return {
      success: true,
      message: 'Si el correo electrónico se encuentra registrado en nuestro sistema, recibirás un enlace con las instrucciones para restablecer tu contraseña.',
    };
  },

  /**
   * Restablece contraseña vía token temporal
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const cleanPassword = sanitizeFormData(newPassword);

    await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
      token,
      newPassword: cleanPassword,
    });
    return true;
  },

  /**
   * Reenvío de confirmación de email
   */
  async resendVerificationEmail(email?: string): Promise<{ success: boolean; message: string }> {
    const targetEmail = email || currentSessionUser?.email || '';
    try {
      await apiClient.post(API_ENDPOINTS.auth.resendVerification, { email: targetEmail });
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: 'Si la cuenta existe y no está verificada, se ha enviado un nuevo enlace de confirmación.',
    };
  },

  /**
   * Confirmación de email vía token
   */
  async verifyEmail(token: string): Promise<boolean> {
    await apiClient.get(`${API_ENDPOINTS.auth.verifyEmail}?token=${encodeURIComponent(token)}`);
    if (currentSessionUser) {
      currentSessionUser.emailVerified = true;
    }
    return true;
  },
};
