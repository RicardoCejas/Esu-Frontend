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
          const isDev = localStorage.getItem('esu_dev_mode') === 'true';
          const savedRole = (localStorage.getItem('esu_dev_active_role') as UserRole) || null;
          let refreshedUser: User | null = null;
          try {
            refreshedUser = await authService.refreshSession();
          } catch {
            // Backend offline
          }
          if (isMounted && refreshedUser && !isDev) {
            setUser(refreshedUser);
          } else if (isMounted) {
            let fallbackUser = authService.getCurrentUser();
            if (isDev && savedRole) {
              const matched = MOCK_USERS.find((u) => u.rol === savedRole);
              if (matched) {
                fallbackUser = { ...matched, isDeveloper: true };
              }
            }
            if (!fallbackUser) {
              fallbackUser = isDev
                ? { ...(MOCK_USERS.find((u) => u.email === 'dev@esu.gob.ar') || MOCK_USERS[4]), isDeveloper: true }
                : (authService.getCurrentUser() || MOCK_USERS[0]);
            }
            setUser(fallbackUser);
            authService.setCurrentUser(fallbackUser);
          }
        } else {
          localStorage.removeItem('esu_dev_mode');
          localStorage.removeItem('esu_dev_active_role');
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
        localStorage.removeItem('esu_dev_mode');
        localStorage.removeItem('esu_dev_active_role');
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
    localStorage.removeItem('esu_dev_mode');
    localStorage.removeItem('esu_dev_active_role');
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

  // Función utilitaria para cambiar de rol en entorno de evaluación (HU-DEV)
  const switchRole = (newRole: UserRole) => {
    const isDev = user?.isDeveloper || localStorage.getItem('esu_dev_mode') === 'true';
    const baseUser = MOCK_USERS.find((u) => u.rol === newRole) || {
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
    const targetUser = { ...baseUser, isDeveloper: isDev };
    tokenStorage.setAccessToken(`mock-token-${targetUser.id}`);
    authService.setCurrentUser(targetUser);
    setUser(targetUser);
    sessionStorage.setItem('esu_session_active', '1');
    localStorage.setItem('esu_dev_mode', 'true');
    localStorage.setItem('esu_dev_active_role', newRole);
    authService.devSwitchRole(newRole);
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
