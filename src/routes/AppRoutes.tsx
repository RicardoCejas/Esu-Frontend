import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/home/HomePage';
import { ActivityMonitor } from '@/components/auth/ActivityMonitor';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';
import { RequireCentroSaludGuard } from './RequireCentroSaludGuard';
import { PermissionGuard } from './PermissionGuard';

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
const CredencialPublicaPage = React.lazy(() => import('@/features/paciente/CredencialPublicaPage').then(m => ({ default: m.CredencialPublicaPage })));

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
const MetricasCentroPage = React.lazy(() => import('@/features/recepcion/MetricasCentroPage').then(m => ({ default: m.MetricasCentroPage })));
const MiSedePage = React.lazy(() => import('@/features/recepcion/MiSedePage').then(m => ({ default: m.MiSedePage })));
const PersonalCentroPage = React.lazy(() => import('@/features/recepcion/PersonalCentroPage').then(m => ({ default: m.PersonalCentroPage })));
const EditarSedePage = React.lazy(() => import('@/features/recepcion/EditarSedePage').then(m => ({ default: m.EditarSedePage })));
const NuevoConsultorioPage = React.lazy(() => import('@/features/recepcion/NuevoConsultorioPage').then(m => ({ default: m.NuevoConsultorioPage })));
const EditarConsultorioPage = React.lazy(() => import('@/features/recepcion/EditarConsultorioPage').then(m => ({ default: m.EditarConsultorioPage })));
const MedicoDetallePage = React.lazy(() => import('@/features/recepcion/MedicoDetallePage').then(m => ({ default: m.MedicoDetallePage })));
const EspecialidadDetallePage = React.lazy(() => import('@/features/recepcion/EspecialidadDetallePage').then(m => ({ default: m.EspecialidadDetallePage })));
const NuevoPersonalCentroPage = React.lazy(() => import('@/features/recepcion/NuevoPersonalCentroPage').then(m => ({ default: m.NuevoPersonalCentroPage })));
const PersonalPermisosPage = React.lazy(() => import('@/features/recepcion/PersonalPermisosPage').then(m => ({ default: m.PersonalPermisosPage })));
const PacienteDetallePage = React.lazy(() => import('@/features/recepcion/PacienteDetallePage').then(m => ({ default: m.PacienteDetallePage })));
const NuevoTurnoMostradorPage = React.lazy(() => import('@/features/recepcion/NuevoTurnoMostradorPage').then(m => ({ default: m.NuevoTurnoMostradorPage })));
const NuevoSobreturnoPage = React.lazy(() => import('@/features/recepcion/NuevoSobreturnoPage').then(m => ({ default: m.NuevoSobreturnoPage })));
const ReagendarTurnoPage = React.lazy(() => import('@/features/recepcion/ReagendarTurnoPage').then(m => ({ default: m.ReagendarTurnoPage })));

// Vistas Admin
const AdminUsuariosPage = React.lazy(() => import('@/features/admin/AdminUsuariosPage').then(m => ({ default: m.AdminUsuariosPage })));
const NuevoUsuarioPage = React.lazy(() => import('@/features/admin/NuevoUsuarioPage').then(m => ({ default: m.NuevoUsuarioPage })));
const AdminEspecialidadesPage = React.lazy(() => import('@/features/admin/AdminEspecialidadesPage').then(m => ({ default: m.AdminEspecialidadesPage })));
const AdminSedesPage = React.lazy(() => import('@/features/admin/AdminSedesPage').then(m => ({ default: m.AdminSedesPage })));
const NuevaEspecialidadPage = React.lazy(() => import('@/features/admin/NuevaEspecialidadPage').then(m => ({ default: m.NuevaEspecialidadPage })));
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

          {/* Credencial Digital Pública Escaneable con Celular */}
          <Route path="/credencial-digital" element={<CredencialPublicaPage />} />
          <Route path="/credencial" element={<Navigate to="/credencial-digital" replace />} />
          <Route path="/validar-credencial" element={<CredencialPublicaPage />} />

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

              {/* Módulo Compartido Sala de Espera y Padrón (Recepción y Médico) */}
              <Route element={<RoleGuard allowedRoles={['RECEPCIONISTA', 'MEDICO']} />}>
                <Route element={<RequireCentroSaludGuard />}>
                  <Route element={<PermissionGuard anyOf={['SALA_ESPERA_GESTIONAR', 'TURNOS_VER']} />}>
                    <Route path="recepcion/kanban" element={<SalasEsperaKanbanPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['PACIENTES_VER']} />}>
                    <Route path="recepcion/pacientes" element={<PadronPacientesPage />} />
                    <Route path="recepcion/pacientes/:id" element={<PacienteDetallePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Módulo Exclusivo Centro de Salud / Recepción (HU-53, HU-54, HU-55, HU-99) */}
              <Route element={<RoleGuard allowedRoles={['RECEPCIONISTA']} />}>
                <Route element={<RequireCentroSaludGuard />}>
                  <Route element={<PermissionGuard anyOf={['TURNOS_VER', 'SALA_ESPERA_GESTIONAR']} />}>
                    <Route path="recepcion" element={<RecepcionPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['PACIENTES_REGISTRAR']} />}>
                    <Route path="recepcion/pacientes/nuevo" element={<NuevoPacientePage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['TURNOS_VER']} />}>
                    <Route path="recepcion/turnos" element={<GestionTurnosAdminPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['MEDICOS_VER']} />}>
                    <Route path="recepcion/medicos" element={<MedicosCentroPage />} />
                    <Route path="recepcion/medicos/:id" element={<MedicoDetallePage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['MEDICOS_ASIGNAR_CONSULTORIO']} />}>
                    <Route path="recepcion/medicos/nuevo" element={<NuevoMedicoPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['MEDICOS_VER', 'CONSULTORIOS_VER']} />}>
                    <Route path="recepcion/especialidades" element={<EspecialidadesCentroPage />} />
                    <Route path="recepcion/especialidades/:id" element={<EspecialidadDetallePage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['REPORTES_VER']} />}>
                    <Route path="recepcion/metricas" element={<MetricasCentroPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['CONSULTORIOS_VER', 'CONSULTORIOS_ADMINISTRAR']} />}>
                    <Route path="recepcion/sede" element={<MiSedePage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['TURNOS_CREAR']} />}>
                    <Route path="recepcion/turnos/nuevo" element={<NuevoTurnoMostradorPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['TURNOS_REAGENDAR']} />}>
                    <Route path="recepcion/turnos/:id/reagendar" element={<ReagendarTurnoPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['SOBRETURNOS_CREAR']} />}>
                    <Route path="recepcion/kanban/sobreturno" element={<NuevoSobreturnoPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['CONSULTORIOS_ADMINISTRAR']} />}>
                    <Route path="recepcion/sede/editar" element={<EditarSedePage />} />
                    <Route path="recepcion/sede/consultorios/nuevo" element={<NuevoConsultorioPage />} />
                    <Route path="recepcion/sede/consultorios/:id/editar" element={<EditarConsultorioPage />} />
                  </Route>
                  <Route element={<PermissionGuard anyOf={['USUARIOS_ADMINISTRAR']} />}>
                    <Route path="recepcion/personal" element={<PersonalCentroPage />} />
                    <Route path="recepcion/personal/nuevo" element={<NuevoPersonalCentroPage />} />
                    <Route path="recepcion/personal/:id/permisos" element={<PersonalPermisosPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Módulo Administrador (HU-56 & HU-70) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="admin" element={<Navigate to="/dashboard/admin/sedes" replace />} />
                <Route path="admin/ocupacion-ausentismo" element={<Navigate to="/dashboard/admin/sedes" replace />} />
                <Route path="admin/sedes" element={<AdminSedesPage />} />
                <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
                <Route path="admin/usuarios/nuevo" element={<NuevoUsuarioPage />} />
                <Route path="admin/especialidades" element={<AdminEspecialidadesPage />} />
                <Route path="admin/especialidades/nueva" element={<NuevaEspecialidadPage />} />
                <Route path="admin/mapa" element={<Navigate to="/dashboard/admin/sedes" replace />} />
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
