import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import { authBroadcast } from '@/lib/authBroadcast';
import { sanitizeFormData } from '@/lib/sanitizer';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints';
import { toFrontendRole, toBackendRole } from '@/lib/roles';
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
  pacienteId?: string | number;
  profesionalId?: string | number;
  email?: string;
  rol?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  emailVerificado?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  requires2FA?: boolean;
  tempToken?: string;
  user?: User;
  message?: string;
}

// Almacenamiento seguro en memoria del perfil de usuario actual
let currentSessionUser: User | null = null;

function normalizeUserRole(rawRole?: string): UserRole {
  return toFrontendRole(rawRole);
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

      if (response.data.requires2FA) {
        const pacienteId = response.data.pacienteId != null ? String(response.data.pacienteId) : undefined;
        const profesionalId = response.data.profesionalId != null ? String(response.data.profesionalId) : undefined;
        const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
        const challengeUser: User = {
          id: usuarioId || '',
          usuarioId,
          pacienteId,
          profesionalId,
          nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
          apellido: response.data.apellido || '',
          email: response.data.email || payload.email,
          dni: response.data.dni || cleanCredentials.dni || '',
          rol: normalizeUserRole(response.data.rol),
          activo: true,
          twoFactorEnabled: true,
          emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
        };

        return {
          token: '',
          user: challengeUser,
          requires2FA: true,
          tempToken: response.data.tempToken,
        };
      }

      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('El servidor no retornó un token de acceso válido.');
      }

      const pacienteId = response.data.pacienteId != null ? String(response.data.pacienteId) : undefined;
      const profesionalId = response.data.profesionalId != null ? String(response.data.profesionalId) : undefined;
      const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
      const user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId,
        profesionalId,
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
      if (credentials.rolSimulado && (isDevCredentials || isDev)) {
        await authService.devSwitchRole(credentials.rolSimulado);
      }

      if (user.rol === 'PACIENTE') {
        try {
          const perfilRes = await apiClient.get<{ id?: number | string; dni?: string; nombre?: string; apellido?: string }>('/pacientes/me');
          if (perfilRes.data?.id) {
            user.id = String(perfilRes.data.id);
            user.pacienteId = user.id;
            if (perfilRes.data.dni) user.dni = perfilRes.data.dni;
            if (perfilRes.data.nombre) user.nombre = perfilRes.data.nombre;
            if (perfilRes.data.apellido) user.apellido = perfilRes.data.apellido;
            currentSessionUser = user;
          }
        } catch {
          // Mantener usuarioId como fallback
        }
      }

      authBroadcast.postMessage({ type: 'LOGIN', userId: user.id });
      return { token, user };
    } catch (error: unknown) {
      

      if (isAxiosError<BackendAuthData>(error)) {
        const extracted = extractApiErrorMessage(error);
        if (extracted && extracted !== 'Error de comunicación con el servidor.') {
          throw new Error(extracted, { cause: error });
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message, { cause: error });
        }
        if (error.response?.status === 401) {
          throw new Error('Credenciales inválidas: email o contraseña incorrectos.', { cause: error });
        }
        if (error.response?.status === 423) {
          throw new Error('La cuenta se encuentra temporalmente bloqueada por superar intentos fallidos.', { cause: error });
        }
        if (error.response?.status === 403) {
          throw new Error('Acceso no permitido o email no verificado.', { cause: error });
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

      const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
      const user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId: response.data.pacienteId != null ? String(response.data.pacienteId) : undefined,
        profesionalId: response.data.profesionalId != null ? String(response.data.profesionalId) : undefined,
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

      if (user.rol === 'PACIENTE' && !user.pacienteId) {
        try {
          const perfilRes = await apiClient.get<{ id?: number | string; dni?: string; nombre?: string; apellido?: string }>('/pacientes/me');
          if (perfilRes.data?.id) {
            user.pacienteId = String(perfilRes.data.id);
            if (perfilRes.data.dni) user.dni = perfilRes.data.dni;
            if (perfilRes.data.nombre) user.nombre = perfilRes.data.nombre;
            if (perfilRes.data.apellido) user.apellido = perfilRes.data.apellido;
            currentSessionUser = user;
          }
        } catch {
          // Ignorar si /pacientes/me no responde
        }
      }

      authBroadcast.postMessage({ type: 'LOGIN', userId: user.id });
      return { token, user };
    } catch (error: unknown) {
      if (isAxiosError<BackendAuthData>(error)) {
        const extracted = extractApiErrorMessage(error);
        if (extracted && extracted !== 'Error de comunicación con el servidor.') {
          throw new Error(extracted, { cause: error });
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message, { cause: error });
        }
        if (error.response?.status === 409) {
          throw new Error('El correo ya está registrado mediante credenciales locales. Por favor inicie sesión con su contraseña tradicional.', { cause: error });
        }
        if (error.response?.status === 401) {
          throw new Error('La credencial de Google no es válida o ha caducado.', { cause: error });
        }
        if (error.response?.status === 403) {
          throw new Error('La cuenta de usuario se encuentra deshabilitada.', { cause: error });
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
      nombre: cleanData.nombre || '',
      apellido: cleanData.apellido || '',
    };

    try {
      const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.register, payload);

      const token = response.data.accessToken || response.data.token || '';

      const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
      const user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId: response.data.pacienteId != null ? String(response.data.pacienteId) : undefined,
        nombre: cleanData.nombre,
        apellido: cleanData.apellido,
        email,
        dni: cleanData.dni,
        rol: 'PACIENTE',
        activo: true,
        emailVerified: true,
      };

      if (token) {
        tokenStorage.setAccessToken(token);
        currentSessionUser = user;
        sessionStorage.setItem('esu_session_active', '1');
      }

      return {
        token,
        user,
      };
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Error al registrar el paciente.'), { cause: error });
    }
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

      const res = await apiClient.get<{
        id: number;
        usuarioId?: number;
        pacienteId?: number | null;
        profesionalId?: number | null;
        email: string;
        rol: string;
        nombre?: string;
        apellido?: string;
        dni?: string;
        activo: boolean;
        verificado: boolean;
      }>(API_ENDPOINTS.auth.me);
      if (res.data) {
        const userRol = normalizeUserRole(res.data.rol);
        const pacienteId = res.data.pacienteId != null ? String(res.data.pacienteId) : undefined;
        const profesionalId = res.data.profesionalId != null ? String(res.data.profesionalId) : undefined;
        const authUserId = String(res.data.usuarioId || res.data.id);
        let resolvedPacienteId = pacienteId;
        let dni = res.data.dni || String(res.data.id);
        let nombre = res.data.nombre || (res.data.email ? res.data.email.split('@')[0] : 'Usuario');
        let apellido = res.data.apellido || '';

        if (userRol === 'PACIENTE' && !resolvedPacienteId) {
          try {
            const perfilRes = await apiClient.get<{ id?: number | string; dni?: string; nombre?: string; apellido?: string }>('/pacientes/me');
            if (perfilRes.data?.id) {
              resolvedPacienteId = String(perfilRes.data.id);
              if (perfilRes.data.dni) dni = perfilRes.data.dni;
              if (perfilRes.data.nombre) nombre = perfilRes.data.nombre;
              if (perfilRes.data.apellido) apellido = perfilRes.data.apellido;
            }
          } catch {
            // Fallback si no está disponible
          }
        }

        const refreshedUser: User = {
          id: authUserId,
          usuarioId: authUserId,
          pacienteId: resolvedPacienteId,
          profesionalId,
          nombre,
          apellido,
          email: res.data.email,
          dni,
          rol: userRol,
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
      const res = await apiClient.post<BackendAuthData>(
        API_ENDPOINTS.auth.devSwitchRole,
        { role: toBackendRole(newRole) },
        { headers: { 'X-Dev-Secret': 'dev-secret-esu-2026' } }
      );
      const newToken = res.data?.accessToken || res.data?.token;
      if (newToken) {
        tokenStorage.setAccessToken(newToken);
      }
      if (res.data?.usuarioId && currentSessionUser) {
        currentSessionUser.id = String(res.data.usuarioId);
      }
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
   * Cambio de contraseña para usuarios autenticados
   */
  async cambiarPassword(passwordActual: string, nuevaPassword: string): Promise<{ success: boolean; message: string }> {
    const cleanActual = sanitizeFormData(passwordActual);
    const cleanNueva = sanitizeFormData(nuevaPassword);

    const response = await apiClient.post<{ mensaje?: string }>(API_ENDPOINTS.auth.cambiarPassword, {
      passwordActual: cleanActual,
      nuevaPassword: cleanNueva,
    });

    return {
      success: true,
      message: response.data?.mensaje || 'Contraseña actualizada exitosamente.',
    };
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
   * Confirmaci��n de email v��a token
   */
  async verifyEmail(token: string): Promise<boolean> {
    await apiClient.get(`${API_ENDPOINTS.auth.verifyEmail}?token=${encodeURIComponent(token)}`);
    if (currentSessionUser) {
      currentSessionUser.emailVerified = true;
    }
    return true;
  },

  async setup2FA(): Promise<TwoFactorSetupData> {
    const response = await apiClient.post<TwoFactorSetupData>(API_ENDPOINTS.auth.twoFactorSetup);
    return response.data;
  },

  async confirm2FA(code: string): Promise<boolean> {
    const response = await apiClient.post<{ success?: boolean }>(API_ENDPOINTS.auth.twoFactorVerify, {
      code: code.trim(),
    });
    if (currentSessionUser) {
      currentSessionUser.twoFactorEnabled = true;
    }
    return response.data?.success ?? true;
  },

  async verify2FALogin(tempToken: string, code: string, isBackupCode = false): Promise<AuthResponse> {
    const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.twoFactorChallenge, {
      tempToken,
      code: code.trim(),
      isBackupCode,
    });

    const token = response.data.accessToken || response.data.token;
    if (!token) {
      throw new Error('El servidor no retornó un token de acceso válido.');
    }

    const pacienteId = response.data.pacienteId != null ? String(response.data.pacienteId) : undefined;
    const profesionalId = response.data.profesionalId != null ? String(response.data.profesionalId) : undefined;
    const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
    const user: User = {
      id: usuarioId || String(Date.now()),
      usuarioId,
      pacienteId,
      profesionalId,
      nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
      apellido: response.data.apellido || '',
      email: response.data.email || '',
      dni: response.data.dni || '',
      rol: normalizeUserRole(response.data.rol),
      activo: true,
      twoFactorEnabled: true,
      emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
    };

    tokenStorage.setAccessToken(token);
    currentSessionUser = user;
    sessionStorage.setItem('esu_session_active', '1');
    authBroadcast.postMessage({ type: 'LOGIN', userId: user.id });
    return { token, user };
  },

  async disable2FA(password?: string, code?: string): Promise<boolean> {
    await apiClient.post(API_ENDPOINTS.auth.twoFactorDisable, { password, code });
    if (currentSessionUser) {
      currentSessionUser.twoFactorEnabled = false;
    }
    return true;
  },
};
