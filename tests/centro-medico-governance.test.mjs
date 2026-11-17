import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CENTER_STAFF_ALLOWED_ROLES,
  EXCLUDED_CENTER_PERMISSIONS,
  filterEligibleCenterStaff,
  filterPersonalCentroList,
  isSelfAccount,
  sanitizePermissionsForCenterStaff,
} from '../src/features/recepcion/utils/centroStaffHelpers.ts';

describe('Centro Médico Governance & Multi-Tenant Staff Scoping', () => {
  it('filterEligibleCenterStaff keeps only staff from the active health center and excludes ADMIN/PACIENTE', () => {
    const sampleUsers = [
      { id: '1', email: 'admin@esu.gob.ar', nombre: 'Admin', apellido: 'General', dni: '1', rol: 'ADMIN', centroSaludId: '10', activo: true },
      { id: '2', email: 'pac@esu.gob.ar', nombre: 'Juan', apellido: 'Paciente', dni: '2', rol: 'PACIENTE', centroSaludId: '10', activo: true },
      { id: '3', email: 'recep10@esu.gob.ar', nombre: 'Laura', apellido: 'Gomez', dni: '3', rol: 'RECEPCIONISTA', centroSaludId: '10', activo: true },
      { id: '4', email: 'doc10@esu.gob.ar', nombre: 'Carlos', apellido: 'Martinez', dni: '4', rol: 'MEDICO', centroSaludId: '10', activo: true },
      { id: '5', email: 'doc20@esu.gob.ar', nombre: 'Ana', apellido: 'Lopez', dni: '5', rol: 'PROFESIONAL', centroSaludId: '20', activo: true },
    ];

    const scoped = filterEligibleCenterStaff(sampleUsers, '10');
    assert.deepEqual(
      scoped.map((u) => u.id),
      ['3', '4']
    );
    assert.deepEqual(filterEligibleCenterStaff(sampleUsers, undefined), []);
  });

  it('filterPersonalCentroList filters by search query, role, and active status', () => {
    const staff = [
      { id: '3', email: 'recep10@esu.gob.ar', nombre: 'Laura', apellido: 'Gomez', dni: '30111222', rol: 'RECEPCIONISTA', centroSaludId: '10', activo: true },
      { id: '4', email: 'doc10@esu.gob.ar', nombre: 'Carlos', apellido: 'Martinez', dni: '25999888', rol: 'MEDICO', centroSaludId: '10', activo: false },
    ];

    assert.equal(
      filterPersonalCentroList(staff, { busqueda: '25999', filtroRol: 'TODOS', filtroEstado: 'TODOS' }).length,
      1
    );
    assert.equal(
      filterPersonalCentroList(staff, { busqueda: '', filtroRol: 'MEDICO', filtroEstado: 'INACTIVO' })[0]?.id,
      '4'
    );
    assert.equal(
      filterPersonalCentroList(staff, { busqueda: '', filtroRol: 'RECEPCIONISTA', filtroEstado: 'ACTIVO' })[0]?.id,
      '3'
    );
  });

  it('isSelfAccount prevents center staff from disabling or deleting their own active session', () => {
    const me = { id: '3', usuarioId: '3', email: 'recep10@esu.gob.ar', nombre: 'Laura', apellido: 'Gomez', dni: '', rol: 'RECEPCIONISTA' };
    const peer = { id: '4', usuarioId: '4', email: 'otro@esu.gob.ar', nombre: 'Otro', apellido: 'User', dni: '', rol: 'MEDICO' };

    assert.equal(isSelfAccount({ ...me }, me), true);
    assert.equal(isSelfAccount({ id: '99', email: 'RECEP10@esu.gob.ar', nombre: '', apellido: '', dni: '', rol: 'RECEPCIONISTA' }, me), true);
    assert.equal(isSelfAccount(peer, me), false);
    assert.equal(isSelfAccount(peer, null), false);
  });

  it('sanitizePermissionsForCenterStaff strips network-wide and restricted permissions while allowed roles exclude ADMIN/PACIENTE', () => {
    assert.deepEqual(CENTER_STAFF_ALLOWED_ROLES.map((r) => r.value), ['RECEPCIONISTA', 'PROFESIONAL']);
    assert.deepEqual(EXCLUDED_CENTER_PERMISSIONS, [
      'PACIENTES_FUSIONAR',
      'USUARIOS_ADMINISTRAR',
      'CONSULTORIOS_ADMINISTRAR',
    ]);
    assert.deepEqual(
      sanitizePermissionsForCenterStaff([
        'TURNOS_VER',
        'PACIENTES_FUSIONAR',
        'USUARIOS_ADMINISTRAR',
        'CONSULTORIOS_ADMINISTRAR',
        'REPORTES_VER',
      ]),
      ['TURNOS_VER', 'REPORTES_VER']
    );
  });

  it('Sidebar and AppRoutes separate ADMIN platform tools from Centro Médico operational routes', () => {
    const root = path.resolve(import.meta.dirname, '..');
    const sidebarSource = fs.readFileSync(path.join(root, 'src/components/layout/Sidebar.tsx'), 'utf8');
    const routesSource = fs.readFileSync(path.join(root, 'src/routes/AppRoutes.tsx'), 'utf8');

    const recepBlockMatch = sidebarSource.match(/\/\/ Rutas Centro de Salud \/ Recepción[\s\S]*?\/\/ Rutas Administrador/);
    assert.ok(recepBlockMatch, 'Sidebar reception section should exist');
    const recepBlock = recepBlockMatch[0];

    assert.equal(recepBlock.includes("'ADMIN'"), false, 'ADMIN must not see Centro Médico routes in Sidebar');
    assert.ok(recepBlock.includes("'/dashboard/recepcion/metricas'"));
    assert.ok(recepBlock.includes("'/dashboard/recepcion/sede'"));
    assert.ok(recepBlock.includes("'/dashboard/recepcion/personal'"));

    assert.ok(routesSource.includes('<Route path="recepcion/metricas" element={<MetricasCentroPage />} />'));
    assert.ok(routesSource.includes('<Route path="recepcion/sede" element={<MiSedePage />} />'));
    assert.ok(routesSource.includes('<Route path="recepcion/personal" element={<PersonalCentroPage />} />'));
    assert.equal(routesSource.includes("allowedRoles={['RECEPCIONISTA', 'MEDICO', 'ADMIN']}"), false);
  });
  it('AppRoutes exposes all 11 dedicated Centro Médico operational pages replacing converted modals', () => {
    const root = path.resolve(import.meta.dirname, '..');
    const routesSource = fs.readFileSync(path.join(root, 'src/routes/AppRoutes.tsx'), 'utf8');

    const sharedBlock = routesSource.match(/allowedRoles=\{\['RECEPCIONISTA', 'MEDICO'\]\}[\s\S]*?Módulo Exclusivo Centro de Salud/)?.[0] ?? '';
    assert.ok(sharedBlock.includes('<Route path="recepcion/pacientes/:id" element={<PacienteDetallePage />} />'));

    const recepOnlyBlock = routesSource.match(/allowedRoles=\{\['RECEPCIONISTA'\]\}[\s\S]*?Módulo Administrador/)?.[0] ?? '';
    const expectedRoutes = [
      'recepcion/pacientes/nuevo',
      'recepcion/turnos/nuevo',
      'recepcion/turnos/:id/reagendar',
      'recepcion/kanban/sobreturno',
      'recepcion/medicos/:id',
      'recepcion/especialidades/:id',
      'recepcion/sede/editar',
      'recepcion/sede/consultorios/nuevo',
      'recepcion/personal/nuevo',
      'recepcion/personal/:id/permisos',
    ];
    for (const routePath of expectedRoutes) {
      assert.ok(recepOnlyBlock.includes(`path="${routePath}"`), `Missing dedicated route: ${routePath}`);
    }
  });

  it('Centro Médico page entrypoints no longer import converted blocking modals', () => {
    const root = path.resolve(import.meta.dirname, '..');
    const entrypoints = [
      'src/features/recepcion/MiSedePage.tsx',
      'src/features/recepcion/MedicosCentroPage.tsx',
      'src/features/recepcion/EspecialidadesCentroPage.tsx',
      'src/features/recepcion/PersonalCentroPage.tsx',
      'src/features/recepcion/PadronPacientesPage.tsx',
      'src/features/recepcion/RecepcionPage.tsx',
      'src/features/recepcion/SalasEsperaKanbanPage.tsx',
      'src/features/recepcion/GestionTurnosAdminPage.tsx',
    ];
    const convertedModals = [
      'ModalEditarSede',
      'ModalNuevoConsultorio',
      'MedicoFichaModal',
      'EspecialidadDetalleModal',
      'ModalNuevoPersonalCentro',
      'ModalGestionarPermisosUsuario',
      'ModalAltaRapidaPaciente',
      'ModalTurnoMostrador',
      'ModalCrearSobreturno',
      'ReagendarTurnoModal',
    ];
    for (const rel of entrypoints) {
      const content = fs.readFileSync(path.join(root, rel), 'utf8');
      for (const modalName of convertedModals) {
        assert.equal(content.includes(modalName), false, `${rel} should not reference ${modalName}`);
      }
    }
  });
});
