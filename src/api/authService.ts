import { apiClient } from './apiClient';
import { MOCK_USERS } from './mockData';
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

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Intentar llamada real al backend Spring Boot si está activo
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('esu_auth_token', response.data.token);
      localStorage.setItem('esu_user', JSON.stringify(response.data.user));
      return response.data;
    } catch {
      // Simulación Inteligente según BD: Buscar usuario por email o DNI
      const input = (credentials.email || credentials.dni || '').trim().toLowerCase();
      
      let matchedUser = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase() === input ||
          u.dni === input ||
          (credentials.rolSimulado && u.rol === credentials.rolSimulado)
      );

      // Si es un email o usuario nuevo que no está en los mocks (ej: analuznieto5@gmail.com), la BD lo registra/toma como PACIENTE
      if (!matchedUser) {
        matchedUser = {
          id: `u-${Date.now()}`,
          nombre: input.includes('@') ? input.split('@')[0] : 'Usuario',
          apellido: '',
          email: input.includes('@') ? input : `${input}@email.com`,
          dni: input.includes('@') ? '38123456' : input,
          rol: credentials.rolSimulado || 'PACIENTE',
        };
      }

      const mockResponse: AuthResponse = {
        token: `mock-jwt-token-for-${matchedUser.id}-${Date.now()}`,
        user: matchedUser,
      };

      localStorage.setItem('esu_auth_token', mockResponse.token);
      localStorage.setItem('esu_user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  },

  async register(userData: Omit<User, 'id'> & { password?: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      localStorage.setItem('esu_auth_token', response.data.token);
      localStorage.setItem('esu_user', JSON.stringify(response.data.user));
      return response.data;
    } catch {
      const newUser: User = {
        id: `u-${Date.now()}`,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        dni: userData.dni,
        telefono: userData.telefono,
        rol: userData.rol || 'PACIENTE',
      };

      const mockResponse: AuthResponse = {
        token: `mock-jwt-token-${newUser.id}`,
        user: newUser,
      };
      localStorage.setItem('esu_auth_token', mockResponse.token);
      localStorage.setItem('esu_user', JSON.stringify(newUser));
      return mockResponse;
    }
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('esu_user');
    return saved ? JSON.parse(saved) : null;
  },

  logout(): void {
    localStorage.removeItem('esu_auth_token');
    localStorage.removeItem('esu_user');
  },
};
