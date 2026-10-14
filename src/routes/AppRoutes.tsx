import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/HomePage';
import { RouteLoadingFallback } from '@/components/ui/Skeleton';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';

// HU-60: Code Splitting (Lazy Loading) para optimización Lighthouse y reducción del bundle inicial
const TurneroContainer = lazy(() =>
  import('@/features/turnero/TurneroContainer').then((m) => ({ default: m.TurneroContainer }))
);
const ProfesionalesPage = lazy(() =>
  import('@/features/profesionales/ProfesionalesPage').then((m) => ({ default: m.ProfesionalesPage }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardLayout = lazy(() =>
  import('@/components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
);

// Módulos Protegidos Lazy
const MisTurnosPage = lazy(() =>
  import('@/features/paciente/MisTurnosPage').then((m) => ({ default: m.MisTurnosPage }))
);
const MiHistorialPage = lazy(() =>
  import('@/features/paciente/MiHistorialPage').then((m) => ({ default: m.MiHistorialPage }))
);
const AgendaMedicaPage = lazy(() =>
  import('@/features/medico/AgendaMedicaPage').then((m) => ({ default: m.AgendaMedicaPage }))
);
const AtencionConsultaPage = lazy(() =>
  import('@/features/medico/AtencionConsultaPage').then((m) => ({ default: m.AtencionConsultaPage }))
);
const RecepcionPage = lazy(() =>
  import('@/features/recepcion/RecepcionPage').then((m) => ({ default: m.RecepcionPage }))
);
const PadronPacientesPage = lazy(() =>
  import('@/features/recepcion/PadronPacientesPage').then((m) => ({ default: m.PadronPacientesPage }))
);
const GestionTurnosAdminPage = lazy(() =>
  import('@/features/recepcion/GestionTurnosAdminPage').then((m) => ({ default: m.GestionTurnosAdminPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminUsuariosPage = lazy(() =>
  import('@/features/admin/AdminUsuariosPage').then((m) => ({ default: m.AdminUsuariosPage }))
);
const AdminEspecialidadesPage = lazy(() =>
  import('@/features/admin/AdminEspecialidadesPage').then((m) => ({ default: m.AdminEspecialidadesPage }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
    </Suspense>
  );
};
