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
      const payload = {
        email: credentials.email || (credentials.dni ? `${credentials.dni}@esu.com` : ''),
        password: credentials.password || 'password123',
      };
      const response = await apiClient.post<any>('/auth/login', payload);

      const token = response.data.accessToken || response.data.token || `token-${Date.now()}`;
      const user: User = {
        id: String(response.data.usuarioId || Date.now()),
        nombre: response.data.email ? response.data.email.split('@')[0] : 'Usuario',
        apellido: '',
        email: response.data.email || payload.email,
        dni: credentials.dni || '38123456',
        rol: (response.data.rol as UserRole) || credentials.rolSimulado || 'PACIENTE',
        activo: true,
      };

      const authData: AuthResponse = { token, user };
      localStorage.setItem('esu_auth_token', token);
      localStorage.setItem('esu_user', JSON.stringify(user));
      return authData;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas: email o contraseña incorrectos.');
      }
      // Si el servidor está apagado (sin response), usar simulación local
      if (!error.response) {
        const input = (credentials.email || credentials.dni || '').trim().toLowerCase();
        let matchedUser = MOCK_USERS.find(
          (u) =>
            u.email.toLowerCase() === input ||
            u.dni === input ||
            (credentials.rolSimulado && u.rol === credentials.rolSimulado)
        );

        if (!matchedUser) {
          matchedUser = {
            id: `u-${Date.now()}`,
            nombre: input.includes('@') ? input.split('@')[0] : 'Usuario',
            apellido: '',
            email: input.includes('@') ? input : `${input}@email.com`,
            dni: input.includes('@') ? '38123456' : input,
            rol: credentials.rolSimulado || 'PACIENTE',
            activo: true,
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
      throw error;
    }
  },

  async register(userData: Omit<User, 'id'> & { password?: string }): Promise<AuthResponse> {
    const payload = {
      email: userData.email,
      password: userData.password || 'password123',
      rol: userData.rol || 'PACIENTE',
    };

    try {
      const response = await apiClient.post<any>('/auth/registro', payload);

      const token = response.data.accessToken || response.data.token || `token-${Date.now()}`;
      const user: User = {
        id: String(response.data.usuarioId || Date.now()),
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: response.data.email || userData.email,
        dni: userData.dni,
        telefono: userData.telefono,
        rol: (response.data.rol as UserRole) || userData.rol || 'PACIENTE',
        activo: true,
      };

      const authData: AuthResponse = { token, user };
      localStorage.setItem('esu_auth_token', token);
      localStorage.setItem('esu_user', JSON.stringify(user));
      return authData;
    } catch (error: any) {
      // Si el backend rechazó la creación (ej. email duplicado)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.status === 400 || error.response?.status === 409) {
        throw new Error(`El email "${userData.email}" ya se encuentra registrado.`);
      }

      // Solo si el servidor backend no responde en absoluto
      if (!error.response) {
        const newUser: User = {
          id: `u-${Date.now()}`,
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          dni: userData.dni,
          telefono: userData.telefono,
          rol: userData.rol || 'PACIENTE',
          activo: true,
        };
        const mockResponse: AuthResponse = {
          token: `mock-jwt-token-${newUser.id}`,
          user: newUser,
        };
        localStorage.setItem('esu_auth_token', mockResponse.token);
        localStorage.setItem('esu_user', JSON.stringify(newUser));
        return mockResponse;
      }

      throw error;
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
