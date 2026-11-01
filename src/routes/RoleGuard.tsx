import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { ROLE_HOME } from '@/lib/roles';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const isDev = Boolean(import.meta.env.DEV && (user?.isDeveloper || user?.email === 'dev@esu.gob.ar'));

  // En producción, solo el rol verificado por backend concede acceso
  if (!user || (!allowedRoles.includes(user.rol) && !isDev)) {
    const target = user?.rol ? ROLE_HOME[user.rol] : '/login';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
