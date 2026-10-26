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

  if (!user || !allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard correspondiente a su rol si intenta entrar a una vista no permitida
    const target = user?.rol ? ROLE_HOME[user.rol] : '/login';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
