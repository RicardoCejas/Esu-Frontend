import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/HomePage';
import { ActivityMonitor } from '@/components/auth/ActivityMonitor';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';

// Lazy loading de rutas secundarias para optimización de bundle
const TurneroContainer = React.lazy(() => import('@/features/turnero/TurneroContainer').then(m => ({ default: m.TurneroContainer })));
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/features/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('@/features/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('@/features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = React.lazy(() => import('@/features/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ProfesionalesPage = React.lazy(() => import('@/features/profesionales/ProfesionalesPage').then(m => ({ default: m.ProfesionalesPage })));
const AgendaMedicaPublicaPage = React.lazy(() => import('@/features/agenda/AgendaMedicaPage').then(m => ({ default: m.AgendaMedicaPublicaPage })));

// Vistas Paciente
const MisTurnosPage = React.lazy(() => import('@/features/paciente/MisTurnosPage').then(m => ({ default: m.MisTurnosPage })));
const MiHistorialPage = React.lazy(() => import('@/features/paciente/MiHistorialPage').then(m => ({ default: m.MiHistorialPage })));
const MisRecetasPage = React.lazy(() => import('@/features/paciente/MisRecetasPage').then(m => ({ default: m.MisRecetasPage })));
const MisEstudiosPage = React.lazy(() => import('@/features/paciente/MisEstudiosPage').then(m => ({ default: m.MisEstudiosPage })));
const CentrosSaludPacientePage = React.lazy(() => import('@/features/paciente/CentrosSaludPacientePage').then(m => ({ default: m.CentrosSaludPacientePage })));

// Vistas Médico
const AgendaMedicaPage = React.lazy(() => import('@/features/medico/AgendaMedicaPage').then(m => ({ default: m.AgendaMedicaPage })));
const AtencionConsultaPage = React.lazy(() => import('@/features/medico/AtencionConsultaPage').then(m => ({ default: m.AtencionConsultaPage })));

// Vistas Recepción
const RecepcionPage = React.lazy(() => import('@/features/recepcion/RecepcionPage').then(m => ({ default: m.RecepcionPage })));
const PadronPacientesPage = React.lazy(() => import('@/features/recepcion/PadronPacientesPage').then(m => ({ default: m.PadronPacientesPage })));
const NuevoPacientePage = React.lazy(() => import('@/features/recepcion/NuevoPacientePage').then(m => ({ default: m.NuevoPacientePage })));
const GestionTurnosAdminPage = React.lazy(() => import('@/features/recepcion/GestionTurnosAdminPage').then(m => ({ default: m.GestionTurnosAdminPage })));
const SalasEsperaKanbanPage = React.lazy(() => import('@/features/recepcion/SalasEsperaKanbanPage').then(m => ({ default: m.SalasEsperaKanbanPage })));
const PantallaTurnosTVPage = React.lazy(() => import('@/features/recepcion/PantallaTurnosTVPage').then(m => ({ default: m.PantallaTurnosTVPage })));
const MedicosCentroPage = React.lazy(() => import('@/features/recepcion/MedicosCentroPage').then(m => ({ default: m.MedicosCentroPage })));
const NuevoMedicoPage = React.lazy(() => import('@/features/recepcion/NuevoMedicoPage').then(m => ({ default: m.NuevoMedicoPage })));
const EspecialidadesCentroPage = React.lazy(() => import('@/features/recepcion/EspecialidadesCentroPage').then(m => ({ default: m.EspecialidadesCentroPage })));

// Vistas Admin
const AdminDashboardPage = React.lazy(() => import('@/features/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const MetricasOcupacionAusentismoPage = React.lazy(() => import('@/features/admin/MetricasOcupacionAusentismoPage').then(m => ({ default: m.MetricasOcupacionAusentismoPage })));
const AdminUsuariosPage = React.lazy(() => import('@/features/admin/AdminUsuariosPage').then(m => ({ default: m.AdminUsuariosPage })));
const NuevoUsuarioPage = React.lazy(() => import('@/features/admin/NuevoUsuarioPage').then(m => ({ default: m.NuevoUsuarioPage })));
const AdminEspecialidadesPage = React.lazy(() => import('@/features/admin/AdminEspecialidadesPage').then(m => ({ default: m.AdminEspecialidadesPage })));
const AdminSedesPage = React.lazy(() => import('@/features/admin/AdminSedesPage').then(m => ({ default: m.AdminSedesPage })));
const NuevaEspecialidadPage = React.lazy(() => import('@/features/admin/NuevaEspecialidadPage').then(m => ({ default: m.NuevaEspecialidadPage })));
const AdminMapaPinesPage = React.lazy(() => import('@/features/admin/AdminMapaPinesPage').then(m => ({ default: m.AdminMapaPinesPage })));
const NuevoProfesionalPage = React.lazy(() => import('@/features/profesionales/NuevoProfesionalPage').then(m => ({ default: m.NuevoProfesionalPage })));

// Perfil (todos los roles)
const MiPerfilPage = React.lazy(() => import('@/features/perfil/MiPerfilPage').then(m => ({ default: m.MiPerfilPage })));

// Vistas Farmacia (HU-77)
const PharmacyValidationView = React.lazy(() => import('@/features/farmacia/PharmacyValidationView').then(m => ({ default: m.PharmacyValidationView })));

export const AppRoutes: React.FC = () => {
  return (
    <>
      {/* HU-44: Monitor global de actividad del cliente con advertencia y cierre forzoso */}
      <ActivityMonitor />

      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          {/* Redirección directa de Perfil para mantener Sidebar */}
          <Route path="/perfil" element={<Navigate to="/dashboard/perfil" replace />} />

          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/agenda-medica" element={<AgendaMedicaPublicaPage />} />
          <Route path="/agenda" element={<Navigate to="/agenda-medica" replace />} />
          <Route path="/especialidades/agenda" element={<Navigate to="/agenda-medica" replace />} />
          <Route path="/turnero" element={<TurneroContainer />} />
          <Route path="/turnero/demo" element={<TurneroContainer isDemoMode={true} />} />
          <Route path="/profesionales" element={<ProfesionalesPage />} />
          <Route path="/profesionales/nuevo" element={<NuevoProfesionalPage />} />
          <Route path="/medicos" element={<Navigate to="/profesionales" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Módulo Farmacia y Validación QR (HU-77) */}
          <Route path="/farmacia/validar-receta" element={<PharmacyValidationView />} />
          <Route path="/farmacia" element={<Navigate to="/farmacia/validar-receta" replace />} />

          {/* HU-71 & HU-43: Rutas de Recuperación de Contraseña y Verificación de Email */}
          <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
          <Route path="/olvido-password" element={<Navigate to="/recuperar-password" replace />} />
          <Route path="/recuperar" element={<Navigate to="/recuperar-password" replace />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verificar-email" element={<VerifyEmailPage />} />

          {/* HU-55: Pantalla Pública Tótem / TV de Turnos */}
          <Route path="/pantalla-turnos" element={<PantallaTurnosTVPage />} />
          <Route path="/totem" element={<Navigate to="/pantalla-turnos" replace />} />

          {/* Rutas Protegidas del Dashboard con Layout Unificado y AuthGuard */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Perfil con Sidebar siempre visible a la izquierda (todos los roles) */}
              <Route path="perfil" element={<MiPerfilPage />} />
              {/* Módulo Paciente */}
              <Route element={<RoleGuard allowedRoles={['PACIENTE']} />}>
                <Route path="paciente" element={<MisTurnosPage />} />
                <Route path="paciente/historial" element={<MiHistorialPage />} />
                <Route path="paciente/recetas" element={<MisRecetasPage />} />
                <Route path="paciente/estudios" element={<MisEstudiosPage />} />
                <Route path="paciente/centros" element={<CentrosSaludPacientePage />} />
              </Route>

              {/* Módulo Médico */}
              <Route element={<RoleGuard allowedRoles={['MEDICO']} />}>
                <Route path="medico" element={<AgendaMedicaPage />} />
                <Route path="medico/atencion" element={<AtencionConsultaPage />} />
              </Route>

              {/* Módulo Recepción y Sala de Espera (HU-53, HU-54, HU-55) */}
              <Route element={<RoleGuard allowedRoles={['RECEPCIONISTA', 'MEDICO', 'ADMIN']} />}>
                <Route path="recepcion" element={<RecepcionPage />} />
                <Route path="recepcion/kanban" element={<SalasEsperaKanbanPage />} />
                <Route path="recepcion/pacientes" element={<PadronPacientesPage />} />
                <Route path="recepcion/pacientes/nuevo" element={<NuevoPacientePage />} />
                <Route path="recepcion/turnos" element={<GestionTurnosAdminPage />} />
                <Route path="recepcion/medicos" element={<MedicosCentroPage />} />
                <Route path="recepcion/medicos/nuevo" element={<NuevoMedicoPage />} />
                <Route path="recepcion/especialidades" element={<EspecialidadesCentroPage />} />
              </Route>

              {/* Módulo Administrador (HU-56 & HU-70) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/ocupacion-ausentismo" element={<MetricasOcupacionAusentismoPage />} />
                <Route path="admin/sedes" element={<AdminSedesPage />} />
                <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
                <Route path="admin/usuarios/nuevo" element={<NuevoUsuarioPage />} />
                <Route path="admin/especialidades" element={<AdminEspecialidadesPage />} />
                <Route path="admin/especialidades/nueva" element={<NuevaEspecialidadPage />} />
                <Route path="admin/mapa" element={<AdminMapaPinesPage />} />
                <Route path="admin/profesionales/nuevo" element={<NuevoProfesionalPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};
