import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { authService, type LoginCredentials, type AuthResponse } from '@/api/authService';
import { tokenStorage } from '@/api/tokenStorage';
import { authBroadcast, type AuthBroadcastMessage } from '@/lib/authBroadcast';
import { MOCK_USERS } from '@/api/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicialización de sesión segura en memoria (HU-41)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const sessionActive = sessionStorage.getItem('esu_session_active');
        if (sessionActive) {
          // Intentar refresh silencioso con cookies HttpOnly del backend
          const refreshedUser = await authService.refreshSession();
          if (isMounted && refreshedUser) {
            setUser(refreshedUser);
          } else if (isMounted) {
            // Si no responde el backend pero había sesión activa en desarrollo
            const fallbackUser = authService.getCurrentUser() || MOCK_USERS[0];
            setUser(fallbackUser);
            authService.setCurrentUser(fallbackUser);
          }
        }
      } catch (err) {
        console.warn('No se pudo restaurar la sesión en memoria:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Sincronización multi-pestaña mediante BroadcastChannel (HU-44)
    const unsubscribeBroadcast = authBroadcast.subscribe((msg: AuthBroadcastMessage) => {
      if (msg.type === 'LOGOUT') {
        setUser(null);
        tokenStorage.clearToken();
      }
    });

    return () => {
      isMounted = false;
      unsubscribeBroadcast();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      if (!authData.requires2FA && authData.user) {
        setUser(authData.user);
      }
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password?: string }) => {
    setIsLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      authService.setCurrentUser(updated);
      return updated;
    });
  }, []);

  // Función utilitaria para cambiar de rol en entorno de evaluación
  const switchRole = (newRole: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.rol === newRole) || {
      id: `u-${newRole.toLowerCase()}-demo`,
      nombre: `Usuario ${newRole}`,
      apellido: 'Demo',
      email: `${newRole.toLowerCase()}@esu.salud.gob.ar`,
      dni: '30000000',
      rol: newRole,
      activo: true,
      twoFactorEnabled: false,
      emailVerified: true,
    };
    tokenStorage.setAccessToken(`mock-token-${targetUser.id}`);
    authService.setCurrentUser(targetUser);
    setUser(targetUser);
    sessionStorage.setItem('esu_session_active', '1');
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
        updateUser,
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
