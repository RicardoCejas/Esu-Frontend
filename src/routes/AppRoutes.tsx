import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/HomePage';
import { TurneroContainer } from '@/features/turnero/TurneroContainer';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProfesionalesPage } from '@/features/profesionales/ProfesionalesPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';

// Vistas Paciente
import { MisTurnosPage } from '@/features/paciente/MisTurnosPage';
import { MiHistorialPage } from '@/features/paciente/MiHistorialPage';

// Vistas Médico
import { AgendaMedicaPage } from '@/features/medico/AgendaMedicaPage';
import { AtencionConsultaPage } from '@/features/medico/AtencionConsultaPage';

// Vistas Recepción
import { RecepcionPage } from '@/features/recepcion/RecepcionPage';
import { PadronPacientesPage } from '@/features/recepcion/PadronPacientesPage';
import { GestionTurnosAdminPage } from '@/features/recepcion/GestionTurnosAdminPage';

// Vistas Admin
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminUsuariosPage } from '@/features/admin/AdminUsuariosPage';
import { AdminEspecialidadesPage } from '@/features/admin/AdminEspecialidadesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/turnero" element={<TurneroContainer />} />
      <Route path="/profesionales" element={<ProfesionalesPage />} />
      <Route path="/medicos" element={<Navigate to="/profesionales" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Rutas Protegidas del Dashboard con Layout Unificado y AuthGuard */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Módulo Paciente */}
          <Route element={<RoleGuard allowedRoles={['PACIENTE', 'ADMIN']} />}>
            <Route path="paciente" element={<MisTurnosPage />} />
            <Route path="paciente/historial" element={<MiHistorialPage />} />
          </Route>

          {/* Módulo Médico */}
          <Route element={<RoleGuard allowedRoles={['MEDICO', 'ADMIN']} />}>
            <Route path="medico" element={<AgendaMedicaPage />} />
            <Route path="medico/atencion" element={<AtencionConsultaPage />} />
          </Route>

          {/* Módulo Recepción y Sala de Espera */}
          <Route element={<RoleGuard allowedRoles={['RECEPCIONISTA', 'MEDICO', 'ADMIN']} />}>
            <Route path="recepcion" element={<RecepcionPage />} />
            <Route path="recepcion/pacientes" element={<PadronPacientesPage />} />
            <Route path="recepcion/turnos" element={<GestionTurnosAdminPage />} />
          </Route>

          {/* Módulo Administrador */}
          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
            <Route path="admin/especialidades" element={<AdminEspecialidadesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
