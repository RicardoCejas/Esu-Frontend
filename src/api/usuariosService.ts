import { apiClient } from './apiClient.ts';
import { API_ENDPOINTS, extractApiErrorMessage } from './endpoints.ts';
import type { User } from '@/types';
import {
  type CreateUserRequest,
  toNumericId,
  normalizeUsuario,
  validateAndBuildCreateUserPayload,
} from './usuariosNormalizer.ts';

export type { CreateUserRequest };
export { toNumericId, normalizeUsuario, validateAndBuildCreateUserPayload };

export const usuariosService = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.usuarios.todos);
      return Array.isArray(res.data) ? res.data.map(normalizeUsuario) : [];
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener el listado de usuarios.'), { cause: err });
    }
  },

  async getById(id: string | number): Promise<User> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.usuarios.byId(numId));
      return normalizeUsuario(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo obtener la información del usuario.'), { cause: err });
    }
  },

  async crearUsuario(data: CreateUserRequest): Promise<User> {
    try {
      const payload = validateAndBuildCreateUserPayload(data);
      const res = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.usuarios.crear, payload);
      return normalizeUsuario(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo registrar el usuario.'), { cause: err });
    }
  },

  async cambiarEstado(id: string | number, activo: boolean): Promise<User> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.patch<Record<string, unknown>>(
        `${API_ENDPOINTS.usuarios.cambiarEstado(numId)}?activo=${activo}`,
        { activo }
      );
      return normalizeUsuario(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo cambiar el estado del usuario.'), { cause: err });
    }
  },

  async actualizarAsignacion(
    id: string | number,
    data: { rol?: string; centroSaludId?: string | number | null; centroSaludNombre?: string | null }
  ): Promise<User> {
    try {
      const numId = toNumericId(id);
      const res = await apiClient.put<Record<string, unknown>>(
        API_ENDPOINTS.usuarios.actualizarAsignacion(numId),
        data
      );
      return normalizeUsuario(res.data);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo actualizar la asignación del usuario.'), { cause: err });
    }
  },

  async eliminar(id: string | number): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.delete(API_ENDPOINTS.usuarios.eliminar(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudo eliminar el usuario.'), { cause: err });
    }
  },

  async revocarSesiones(id: string | number): Promise<boolean> {
    try {
      const numId = toNumericId(id);
      await apiClient.post(API_ENDPOINTS.usuarios.revocarSesionesUsuario(numId));
      return true;
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err, 'No se pudieron revocar las sesiones del usuario.'), { cause: err });
    }
  },
};
