import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { PermissionCode, UserRole } from '@/types';

export const usePermissions = () => {
  const { user } = useAuth();

  const permisosSet = useMemo(() => {
    return new Set<string>(user?.permisos ?? []);
  }, [user?.permisos]);

  const can = useCallback(
    (permission: PermissionCode): boolean => {
      if (!user) return false;
      // Super Admin bypass: ADMIN role has all permissions implicitly
      if (user.rol === 'ADMIN') return true;
      return permisosSet.has(permission);
    },
    [user, permisosSet]
  );

  const canAny = useCallback(
    (permissions: PermissionCode[]): boolean => {
      if (!user) return false;
      if (user.rol === 'ADMIN') return true;
      return permissions.some((p) => permisosSet.has(p));
    },
    [user, permisosSet]
  );

  const canAll = useCallback(
    (permissions: PermissionCode[]): boolean => {
      if (!user) return false;
      if (user.rol === 'ADMIN') return true;
      return permissions.every((p) => permisosSet.has(p));
    },
    [user, permisosSet]
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return (user?.rol ?? '') === role;
    },
    [user?.rol]
  );

  return {
    can,
    canAny,
    canAll,
    hasRole,
    permisos: user?.permisos ?? [],
    userRole: user?.rol,
  };
};
