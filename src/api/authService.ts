import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';
import { tokenStorage, refreshSingleFlight } from './tokenStorage';
import { authBroadcast } from '@/lib/authBroadcast';
import { authSessionStorage } from '@/lib/authSessionStorage';
import { sanitizeFormData } from '@/lib/sanitizer';
import { isValidDniFormat } from '../lib/dniValidation.ts';
import { API_ENDPOINTS, extractApiErrorMessage, isDemoModeEnabled } from './endpoints';
import { toFrontendRole, toBackendRole } from '@/lib/roles';
import type { User, UserRole, PermissionCode } from '@/types';

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
  centroSaludId?: string | number;
  centroSaludNombre?: string;
  email?: string;
  rol?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  matricula?: string;
  especialidad?: string;
  emailVerificado?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  requires2FA?: boolean;
  tempToken?: string;
  user?: User;
  message?: string;
  permisos?: string[];
}

interface PacienteMeResponse {
  id?: number | string;
  dni?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  obraSocial?: string;
  nroAfiliado?: string;
  grupoSanguineo?: string;
  fechaNacimiento?: string | number[];
  centroSaludReferenciaId?: number | string;
  centroSaludReferenciaNombre?: string;
}

// Almacenamiento seguro en memoria del perfil de usuario actual
let currentSessionUser: User | null = null;
let refreshSessionInFlight: Promise<User | null> | null = null;

function normalizeUserRole(rawRole?: string): UserRole {
  return toFrontendRole(rawRole);
}

function normalizeFechaNacimiento(raw?: string | number[]): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    if (y && m && d) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return undefined;
  }
  if (typeof raw === 'string') {
    const clean = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      return clean.slice(0, 10);
    }
    const dmy = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }
  }
  return undefined;
}

function isRealPhone(tel?: string): boolean {
  if (!tel) return false;
  const clean = tel.trim();
  return clean.length >= 6 && clean !== 'Sin especificar' && clean !== '3549000000';
}

function readLocalPacienteCache(ids: Array<string | undefined>, email?: string): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  const emailLower = email?.trim().toLowerCase();
  const keys = Array.from(
    new Set([
      ...ids.filter(Boolean).map((id) => `esu_paciente_data_${id}`),
      ...(emailLower ? [`esu_paciente_data_${emailLower}`] : []),
    ])
  );

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        return JSON.parse(raw) as Record<string, string>;
      }
    } catch {
      // Ignorar cache corrupta
    }
  }
  return null;
}

function isDniMarkedVerifiedInStorage(ids: Array<string | undefined>, email?: string): boolean {
  if (typeof window === 'undefined') return false;
  for (const id of ids) {
    if (id && localStorage.getItem(`esu_dni_verified_${id}`) === 'true') return true;
  }
  const emailLower = email?.trim().toLowerCase();
  if (emailLower && localStorage.getItem(`esu_dni_verified_${emailLower}`) === 'true') return true;
  return false;
}

function mergePacienteProfile(user: User, perfil?: PacienteMeResponse | null): User {
  const merged: User = { ...user };
  const usuarioIdKeep = merged.usuarioId || merged.id;
  merged.id = usuarioIdKeep;
  if (!merged.usuarioId && usuarioIdKeep) {
    merged.usuarioId = usuarioIdKeep;
  }

  if (perfil) {
    if (perfil.id !== undefined && perfil.id !== null) {
      merged.pacienteId = String(perfil.id);
    }
    if (perfil.dni && perfil.dni.trim()) merged.dni = perfil.dni.trim();
    if (perfil.nombre && perfil.nombre.trim()) merged.nombre = perfil.nombre.trim();
    if (perfil.apellido && perfil.apellido.trim()) merged.apellido = perfil.apellido.trim();
    if (isRealPhone(perfil.telefono)) merged.telefono = perfil.telefono!.trim();
    if (perfil.obraSocial && perfil.obraSocial.trim()) merged.obraSocial = perfil.obraSocial.trim();
    if (perfil.nroAfiliado && perfil.nroAfiliado.trim()) merged.nroAfiliado = perfil.nroAfiliado.trim();
    if (perfil.grupoSanguineo && perfil.grupoSanguineo.trim()) merged.grupoSanguineo = perfil.grupoSanguineo.trim();
    const fn = normalizeFechaNacimiento(perfil.fechaNacimiento);
    if (fn) merged.fechaNacimiento = fn;
    if (perfil.centroSaludReferenciaId !== undefined && perfil.centroSaludReferenciaId !== null) {
      merged.centroSaludId = String(perfil.centroSaludReferenciaId);
    }
    if (perfil.centroSaludReferenciaNombre && perfil.centroSaludReferenciaNombre.trim()) {
      merged.centroSaludNombre = perfil.centroSaludReferenciaNombre.trim();
    }
  }

  // Respaldo de campos locales complementarios si no vinieron en el DTO
  const candidateIds = [merged.pacienteId, merged.id, usuarioIdKeep];
  const cached = readLocalPacienteCache(candidateIds, merged.email);
  if (cached) {
    if (!isRealPhone(merged.telefono) && isRealPhone(cached.telefono)) {
      merged.telefono = cached.telefono.trim();
    }
    if (!merged.fechaNacimiento && cached.fechaNacimiento) {
      merged.fechaNacimiento = normalizeFechaNacimiento(cached.fechaNacimiento);
    }
    if (!merged.obraSocial && cached.obraSocial) {
      merged.obraSocial = cached.obraSocial;
    }
    if (!merged.nroAfiliado && cached.nroAfiliado) {
      merged.nroAfiliado = cached.nroAfiliado;
    }
  }

  const hasValidDni = isValidDniFormat(merged.dni);
  const hasCompleteIdentity = hasValidDni && isRealPhone(merged.telefono) && Boolean(merged.fechaNacimiento);
  const verifiedStorage = isDniMarkedVerifiedInStorage(candidateIds, merged.email);

  if (hasValidDni && (hasCompleteIdentity || verifiedStorage)) {
    merged.dniVerificado = true;
    if (typeof window !== 'undefined') {
      if (merged.pacienteId) {
        localStorage.setItem(`esu_dni_verified_${merged.pacienteId}`, 'true');
      }
      if (merged.id) {
        localStorage.setItem(`esu_dni_verified_${merged.id}`, 'true');
      }
      if (merged.email) {
        localStorage.setItem(`esu_dni_verified_${merged.email.trim().toLowerCase()}`, 'true');
      }
    }
  }

  return merged;
}

export const authService = {
  /**
   * Inicio de sesión seguro: almacena token en memoria volátil (HU-41)
   * Sanitiza entradas contra XSS (HU-44)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanCredentials = sanitizeFormData(credentials);
    const emailLower = (cleanCredentials.email || cleanCredentials.dni || '').trim().toLowerCase();
    const rawPassword = credentials.password || '';

    if (!rawPassword) {
      throw new Error('Debe ingresar su contraseña.');
    }

    try {
      const payload = {
        email: cleanCredentials.email || (cleanCredentials.dni ? `${cleanCredentials.dni}@esu.com` : ''),
        password: rawPassword,
      };

      const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.login, payload);

      if (response.data.requires2FA) {
        const pacienteId = response.data.pacienteId != null ? String(response.data.pacienteId) : undefined;
        const profesionalId = response.data.profesionalId != null ? String(response.data.profesionalId) : undefined;
        const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
        const centroSaludId = response.data.centroSaludId != null ? String(response.data.centroSaludId) : undefined;
        const centroSaludNombre = response.data.centroSaludNombre || undefined;
        const challengeUser: User = {
          id: usuarioId || '',
          usuarioId,
          pacienteId,
          profesionalId,
          matricula: response.data.matricula,
          especialidad: response.data.especialidad,
          nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
          apellido: response.data.apellido || '',
          email: response.data.email || payload.email,
          dni: response.data.dni || cleanCredentials.dni || '',
        centroSaludId,
        centroSaludNombre,
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
      const centroSaludId = response.data.centroSaludId != null ? String(response.data.centroSaludId) : undefined;
      const centroSaludNombre = response.data.centroSaludNombre || undefined;
      const allowSimulatedRole = Boolean((import.meta.env.DEV || isDemoModeEnabled()) && credentials.rolSimulado);
      let user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId,
        profesionalId,
        matricula: response.data.matricula,
        especialidad: response.data.especialidad,
        nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
        apellido: response.data.apellido || '',
        email: response.data.email || payload.email,
        dni: response.data.dni || cleanCredentials.dni || '',
        centroSaludId,
        centroSaludNombre,
        rol: allowSimulatedRole ? credentials.rolSimulado! : normalizeUserRole(response.data.rol),
        activo: true,
        twoFactorEnabled: false,
        emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
        isDeveloper: Boolean(import.meta.env.DEV && emailLower === 'dev@esu.gob.ar'),
        permisos: ((response.data.permisos as unknown as PermissionCode[]) ?? []),
      };

      tokenStorage.setAccessToken(token);
      currentSessionUser = user;
      authSessionStorage.setSessionActive();
      if (allowSimulatedRole && credentials.rolSimulado) {
        await authService.devSwitchRole(credentials.rolSimulado);
      }

      if (user.rol === 'PACIENTE') {
        try {
          const perfilRes = await apiClient.get<PacienteMeResponse>('/pacientes/me');
          user = mergePacienteProfile(user, perfilRes.data);
        } catch {
          user = mergePacienteProfile(user, null);
        }
        currentSessionUser = user;
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
      const centroSaludId = response.data.centroSaludId != null ? String(response.data.centroSaludId) : undefined;
      const centroSaludNombre = response.data.centroSaludNombre || undefined;
      let user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId: response.data.pacienteId != null ? String(response.data.pacienteId) : undefined,
        profesionalId: response.data.profesionalId != null ? String(response.data.profesionalId) : undefined,
        nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
        apellido: response.data.apellido || '',
        email: response.data.email || '',
        dni: response.data.dni || '',
        centroSaludId,
        centroSaludNombre,
        rol: normalizeUserRole(response.data.rol),
        activo: true,
        twoFactorEnabled: false,
        emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
        isDeveloper: false,
        permisos: ((response.data.permisos as unknown as PermissionCode[]) ?? []),
      };

      tokenStorage.setAccessToken(token);
      currentSessionUser = user;
      authSessionStorage.setSessionActive();

      if (user.rol === 'PACIENTE') {
        try {
          const perfilRes = await apiClient.get<PacienteMeResponse>('/pacientes/me');
          user = mergePacienteProfile(user, perfilRes.data);
        } catch {
          user = mergePacienteProfile(user, null);
        }
        currentSessionUser = user;
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
      password: userData.password || '',
      nombre: cleanData.nombre || '',
      apellido: cleanData.apellido || '',
    };

    try {
      const response = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.register, payload);

      const token = response.data.accessToken || response.data.token || '';

      const usuarioId = response.data.usuarioId != null ? String(response.data.usuarioId) : undefined;
      let user: User = {
        id: usuarioId || String(Date.now()),
        usuarioId,
        pacienteId: response.data.pacienteId != null ? String(response.data.pacienteId) : undefined,
        nombre: cleanData.nombre,
        apellido: cleanData.apellido,
        email,
        dni: response.data.dni || cleanData.dni || '',
        rol: 'PACIENTE',
        activo: true,
        emailVerified: true,
      };

      if (token) {
        tokenStorage.setAccessToken(token);
        currentSessionUser = user;
        authSessionStorage.setSessionActive();
        try {
          const perfilRes = await apiClient.get<PacienteMeResponse>('/pacientes/me');
          user = mergePacienteProfile(user, perfilRes.data);
          currentSessionUser = user;
        } catch {
          // Mantener datos de registro
        }
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
      authSessionStorage.clearSessionActive();
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
   * Renovación silenciosa de sesión vía Refresh Token seguro con single-flight deduplicado
   */
  async refreshSession(): Promise<User | null> {
    if (refreshSessionInFlight) {
      return refreshSessionInFlight;
    }

    refreshSessionInFlight = (async () => {
      try {
        const activeToken = await refreshSingleFlight.run(async () => {
          const refreshRes = await apiClient.post<BackendAuthData>(API_ENDPOINTS.auth.refresh);
          const extracted = refreshRes.data.accessToken || refreshRes.data.token || null;
          if (extracted) {
            tokenStorage.setAccessToken(extracted);
          }
          return extracted;
        });

        const tokenInMemory = activeToken || tokenStorage.getAccessToken();
        if (!tokenInMemory) {
          return null;
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
          matricula?: string;
          especialidad?: string;
          activo: boolean;
          verificado: boolean;
          twoFactorEnabled?: boolean;
          centroSaludId?: number | string | null;
          centroSaludNombre?: string | null;
          permisos?: string[];
        }>(API_ENDPOINTS.auth.me);

        if (res.data) {
          const userRol = normalizeUserRole(res.data.rol);
          const pacienteId = res.data.pacienteId != null ? String(res.data.pacienteId) : undefined;
          const profesionalId = res.data.profesionalId != null ? String(res.data.profesionalId) : undefined;
          const authUserId = String(res.data.usuarioId || res.data.id);
          const centroSaludId = res.data.centroSaludId != null ? String(res.data.centroSaludId) : currentSessionUser?.centroSaludId;
          const centroSaludNombre = res.data.centroSaludNombre || currentSessionUser?.centroSaludNombre;

          const baseUser: User = {
            id: authUserId,
            usuarioId: authUserId,
            pacienteId,
            profesionalId,
            matricula: res.data.matricula,
            especialidad: res.data.especialidad,
            nombre: res.data.nombre || (res.data.email ? res.data.email.split('@')[0] : 'Usuario'),
            apellido: res.data.apellido || '',
            email: res.data.email,
            dni: res.data.dni || (userRol === 'PACIENTE' ? '' : authUserId),
            centroSaludId,
            centroSaludNombre,
            rol: userRol,
            activo: res.data.activo !== false,
            emailVerified: res.data.verificado !== false,
            twoFactorEnabled: res.data.twoFactorEnabled ?? currentSessionUser?.twoFactorEnabled ?? false,
            isDeveloper: import.meta.env.DEV && res.data.email?.toLowerCase() === 'dev@esu.gob.ar',
            permisos: (res.data.permisos as unknown as PermissionCode[]) ?? currentSessionUser?.permisos ?? [],
          };

          let hydratedUser = baseUser;
          if (userRol === 'PACIENTE') {
            try {
              const perfilRes = await apiClient.get<PacienteMeResponse>('/pacientes/me');
              hydratedUser = mergePacienteProfile(baseUser, perfilRes.data);
            } catch {
              hydratedUser = mergePacienteProfile(baseUser, null);
            }
          }

          currentSessionUser = hydratedUser;
          return hydratedUser;
        }
        return null;
      } catch (err: unknown) {
        if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          tokenStorage.clearToken();
          currentSessionUser = null;
          if (typeof window !== 'undefined') {
            authSessionStorage.clearSessionActive();
          }
        }
        return null;
      } finally {
        refreshSessionInFlight = null;
      }
    })();

    return refreshSessionInFlight;
  },

  /**
   * Switch de rol solo operativo en desarrollo
   */
  async devSwitchRole(newRole: UserRole): Promise<void> {
    if (!import.meta.env.DEV && !isDemoModeEnabled()) {
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
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
      token,
      newPassword,
    });
    return true;
  },

  /**
   * Cambio de contraseña para usuarios autenticados
   */
  async cambiarPassword(passwordActual: string, nuevaPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ mensaje?: string }>(API_ENDPOINTS.auth.cambiarPassword, {
      passwordActual,
      nuevaPassword,
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
   * Confirmación de email vía token
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
    const isSuccess = response.data?.success === true;
    if (isSuccess && currentSessionUser) {
      currentSessionUser.twoFactorEnabled = true;
    }
    return isSuccess;
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
    const centroSaludId = response.data.centroSaludId != null ? String(response.data.centroSaludId) : undefined;
    const centroSaludNombre = response.data.centroSaludNombre || undefined;
    let user: User = {
      id: usuarioId || String(Date.now()),
      usuarioId,
      pacienteId,
      profesionalId,
      nombre: response.data.nombre || (response.data.email ? response.data.email.split('@')[0] : 'Usuario'),
      apellido: response.data.apellido || '',
      email: response.data.email || '',
      dni: response.data.dni || '',
      centroSaludId,
      centroSaludNombre,
      rol: normalizeUserRole(response.data.rol),
      activo: true,
      twoFactorEnabled: true,
      emailVerified: response.data.emailVerificado ?? response.data.emailVerified ?? true,
      permisos: ((response.data.permisos as unknown as PermissionCode[]) ?? []),
    };

    tokenStorage.setAccessToken(token);
    currentSessionUser = user;
    authSessionStorage.setSessionActive();

    if (user.rol === 'PACIENTE') {
      try {
        const perfilRes = await apiClient.get<PacienteMeResponse>('/pacientes/me');
        user = mergePacienteProfile(user, perfilRes.data);
      } catch {
        user = mergePacienteProfile(user, null);
      }
      currentSessionUser = user;
    }

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
