import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard correspondiente a su rol si intenta entrar a una vista no permitida
    const redirectMap: Record<UserRole, string> = {
      PACIENTE: '/dashboard/paciente',
      MEDICO: '/dashboard/medico',
      RECEPCIONISTA: '/dashboard/recepcion',
      ADMIN: '/dashboard/admin',
    };

    const target = user?.rol ? redirectMap[user.rol] : '/login';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
