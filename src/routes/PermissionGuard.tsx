import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLE_HOME } from '@/lib/roles';
import type { PermissionCode } from '@/types';

interface PermissionGuardProps {
  anyOf: PermissionCode[];
}

/**
 * Guards protected routes using granular PBAC permissions with safe fallback to prevent redirect loops.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ anyOf }) => {
  const { user } = useAuth();
  const { can, canAny } = usePermissions();
  const location = useLocation();
  const isDev = Boolean(import.meta.env.DEV && (user?.isDeveloper || user?.email === 'dev@esu.gob.ar'));

  if (isDev || canAny(anyOf)) {
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const defaultHome = ROLE_HOME[user.rol] ?? '/dashboard/perfil';
  const safeTarget =
    user.rol === 'RECEPCIONISTA' && !can('TURNOS_VER')
      ? '/dashboard/perfil'
      : location.pathname === defaultHome
      ? '/dashboard/perfil'
      : defaultHome;

  return <Navigate to={safeTarget} replace />;
};
