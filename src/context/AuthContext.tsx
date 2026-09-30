import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { authService, type LoginCredentials } from '@/api/authService';
import { MOCK_USERS } from '@/api/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializar la sesión desde localStorage
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    setIsLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Función utilitaria para cambiar de rol desde el panel o login
  const switchRole = (newRole: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.rol === newRole) || {
      id: `u-${newRole.toLowerCase()}-demo`,
      nombre: `Usuario ${newRole}`,
      apellido: 'Demo',
      email: `${newRole.toLowerCase()}@esu.salud.gob.ar`,
      dni: '30000000',
      rol: newRole,
    };
    setUser(targetUser);
    localStorage.setItem('esu_user', JSON.stringify(targetUser));
    localStorage.setItem('esu_auth_token', `mock-token-${targetUser.id}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
