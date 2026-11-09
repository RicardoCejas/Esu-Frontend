import { apiClient } from './apiClient';
import type { Permiso, PermissionCode, User } from '../types/index.ts';
export { DEFAULT_PERMISSIONS_BY_ROLE } from '../types/index.ts';

export const permisosService = {
  async getCatalogo(): Promise<Permiso[]> {
    const response = await apiClient.get<Permiso[]>('/permisos');
    return response.data;
  },

  async getByUsuario(usuarioId: number | string): Promise<PermissionCode[]> {
    const response = await apiClient.get<PermissionCode[]>(`/permisos/usuario/${usuarioId}`);
    return response.data;
  },

  async updateUsuarioPermisos(usuarioId: number | string, codigosPermisos: PermissionCode[]): Promise<User> {
    const response = await apiClient.put<User>(`/permisos/usuario/${usuarioId}`, codigosPermisos);
    return response.data;
  },
};
