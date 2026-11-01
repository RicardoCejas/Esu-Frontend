import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import { authBroadcast } from '@/lib/authBroadcast';
import { sanitizeFormData } from '@/lib/sanitizer';
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
  requires2FA?: boolean;
  tempToken?: string;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface BackendAuthData {
  accessToken?: string;
  token?: string;
  usuarioId?: string | number;
  email?: string;
  rol?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  requires2FA?: boolean;
  tempToken?: string;
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
   * En producción requiere autenticación real contra el backend (sin fallbacks mock).
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanCredentials = sanitizeFormData(credentials);
    const emailLower = (cleanCredentials.email || cleanCredentials.dni || '').trim().toLowerCase();
    const isDev = import.meta.env.DEV;

    if (!cleanCredentials.password) {
      throw new Error('Debe ingresar su contraseña.');
    }

    try {
      const payload = {
        email: cleanCredentials.email || (cleanCredentials.dni ? `${cleanCredentials.dni}@esu.com` : ''),
        password: cleanCredentials.password,
      };

      const response = await apiClient.post<BackendAuthData>('/auth/login', payload);

      if (response.data.requires2FA) {
        return {
          token: '',
          user: response.data.user || ({} as User),
          requires2FA: true,
          tempToken: response.data.tempToken || `temp-${Date.now()}`,
        };
      }

      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('El servidor no retornó un token de acceso válido.');
      }

      const user: User = {
        id: String(response.data.usuarioId || Date.now()),
        nombre: response.data.email ? response.data.email.split('@')[0] : 'Usuario',
        apellido: '',
        email: response.data.email || payload.email,
        dni: credentials.dni || '38123456',
        rol: normalizeUserRole(response.data.rol),
        activo: true,
        twoFactorEnabled: false,
        emailVerified: response.data.emailVerified ?? true,
        isDeveloper: isDev && emailLower === 'dev@esu.gob.ar',
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
   * Registro público de pacientes
   */
  async register(userData: Omit<User, 'id'> & { password?: string }): Promise<AuthResponse> {
    const cleanData = sanitizeFormData(userData);
    const email = cleanData.email.trim().toLowerCase();

    const payload = {
      email,
      password: cleanData.password || '',
    };

    const response = await apiClient.post<BackendAuthData>('/auth/registro', payload);

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
   * Cierre de sesión seguro con limpieza de almacenamiento local y en memoria
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/usuarios/me/revocar-sesiones');
    } catch {
      // Ignorar fallos de red en logout
    }

    tokenStorage.clearToken();
    currentSessionUser = null;
    sessionStorage.removeItem('esu_session_active');
    authBroadcast.postMessage({ type: 'LOGOUT' });
  },

  getCurrentUser(): User | null {
    return currentSessionUser;
  },

  setCurrentUser(user: User | null): void {
    currentSessionUser = user;
  },

  /**
   * Renovación de token de sesión vía refresh token cookie / me endpoint
   */
  async refreshSession(): Promise<User | null> {
    try {
      const res = await apiClient.get<{ id: number; email: string; rol: string; activo: boolean; verificado: boolean }>(
        '/auth/me'
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
      await apiClient.post('/auth/dev-switch-role', { role: newRole });
    } catch {
      // Permitido en local
    }
  },

  /**
   * Verificación de 2FA - No soportado sin infraestructura TOTP de backend
   */
  async verify2FA(_tempToken: string, _code: string, _isBackupCode: boolean = false): Promise<AuthResponse> {
    throw new Error('El sistema no cuenta con infraestructura TOTP de 2FA habilitada en esta versión.');
  },

  async verify2FALogin(_tempToken: string, _code: string, _isBackupCode: boolean = false): Promise<AuthResponse> {
    throw new Error('El sistema no cuenta con infraestructura TOTP de 2FA habilitada en esta versión.');
  },

  async setup2FA(): Promise<TwoFactorSetupData> {
    throw new Error('El sistema no cuenta con infraestructura TOTP de 2FA habilitada en esta versión.');
  },

  async confirm2FA(_code: string): Promise<void> {
    throw new Error('El sistema no cuenta con infraestructura TOTP de 2FA habilitada en esta versión.');
  },

  async disable2FA(): Promise<void> {
    if (currentSessionUser) {
      currentSessionUser.twoFactorEnabled = false;
    }
  },

  /**
   * Recuperación de Contraseña con respuesta no reveladora
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = sanitizeFormData(email).trim().toLowerCase();

    try {
      await apiClient.post('/auth/forgot-password', { email: cleanEmail });
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

    await apiClient.post('/auth/reset-password', {
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
      await apiClient.post('/auth/verify-email/resend', { email: targetEmail });
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
    await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    if (currentSessionUser) {
      currentSessionUser.emailVerified = true;
    }
    return true;
  },
};
