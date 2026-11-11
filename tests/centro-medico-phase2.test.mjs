import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  DNI_REGEX,
  DNI_VALIDATION_ERROR,
  isValidDniFormat,
  normalizeDniDigits,
} from '../src/lib/dniValidation.ts';
import {
  filterSidebarItems,
  hasSidebarItemAccess,
} from '../src/lib/sidebarPermissions.ts';
import {
  resolveCenterBackendRole,
  validatePerfilOperativo,
} from '../src/features/recepcion/utils/centroStaffHelpers.ts';

describe('Fase 2 — Gobernanza PBAC, Sidebar, DNI Unificado y Personal del Centro', () => {
  it('dniValidation unifica exactamente 7 a 8 dígitos numéricos', () => {
    assert.equal(DNI_REGEX.test('7123456'), true);
    assert.equal(DNI_REGEX.test('32123456'), true);
    assert.equal(normalizeDniDigits('32.123.456-abc'), '32123456');
    assert.equal(isValidDniFormat('32.123.456'), false);
    assert.equal(isValidDniFormat(normalizeDniDigits('32.123.456')), true);

    assert.equal(isValidDniFormat(''), false);
    assert.equal(isValidDniFormat('123456'), false);
    assert.equal(isValidDniFormat('123456789'), false);
    assert.equal(isValidDniFormat('1234567a'), false);
  });

  it('filterSidebarItems aplica PBAC estricto sin ocultar rutas válidas de cada rol', () => {
    const items = [
      { title: 'Recepción', path: '/dashboard/recepcion', roles: ['RECEPCIONISTA'], requiredPermissions: ['TURNOS_VER', 'SALA_ESPERA_GESTIONAR'] },
      { title: 'Kanban', path: '/dashboard/recepcion/kanban', roles: ['RECEPCIONISTA', 'MEDICO'], requiredPermissions: ['SALA_ESPERA_GESTIONAR', 'TURNOS_VER'] },
      { title: 'Padrón', path: '/dashboard/recepcion/pacientes', roles: ['RECEPCIONISTA', 'MEDICO'], requiredPermissions: ['PACIENTES_VER'] },
      { title: 'Métricas', path: '/dashboard/recepcion/metricas', roles: ['RECEPCIONISTA'], requiredPermissions: ['REPORTES_VER'] },
      { title: 'Personal', path: '/dashboard/recepcion/personal', roles: ['RECEPCIONISTA'], requiredPermissions: ['USUARIOS_ADMINISTRAR'] },
      { title: 'Admin Global', path: '/dashboard/admin/auditoria', roles: ['ADMIN'] },
    ];

    const restrictedRecep = new Set(['TURNOS_VER', 'PACIENTES_VER']);
    const visibleRestricted = filterSidebarItems(items, 'RECEPCIONISTA', (req) => req.some((p) => restrictedRecep.has(p)));
    assert.deepEqual(
      visibleRestricted.map((i) => i.path),
      ['/dashboard/recepcion', '/dashboard/recepcion/kanban', '/dashboard/recepcion/pacientes']
    );

    const fullRecep = new Set([
      'TURNOS_VER', 'SALA_ESPERA_GESTIONAR', 'PACIENTES_VER', 'REPORTES_VER', 'USUARIOS_ADMINISTRAR',
    ]);
    const visibleFull = filterSidebarItems(items, 'RECEPCIONISTA', (req) => req.some((p) => fullRecep.has(p)));
    assert.equal(visibleFull.length, 5);

    const medicoGrants = new Set(['TURNOS_VER', 'PACIENTES_VER']);
    const visibleMedico = filterSidebarItems(items, 'MEDICO', (req) => req.some((p) => medicoGrants.has(p)));
    assert.deepEqual(
      visibleMedico.map((i) => i.path),
      ['/dashboard/recepcion/kanban', '/dashboard/recepcion/pacientes']
    );

    assert.equal(hasSidebarItemAccess(items[4], 'ADMIN', () => true), false);
    assert.equal(hasSidebarItemAccess(items[5], 'ADMIN', () => false), true);
  });

  it('resolveCenterBackendRole y validatePerfilOperativo aplican reglas de identidad y rol', () => {
    assert.equal(resolveCenterBackendRole('MEDICO'), 'PROFESIONAL');
    assert.equal(resolveCenterBackendRole('ROLE_PROFESIONAL'), 'PROFESIONAL');
    assert.equal(resolveCenterBackendRole('ROLE_RECEPCIONISTA'), 'RECEPCIONISTA');

    assert.deepEqual(validatePerfilOperativo({ nombre: 'A', apellido: 'Gomez', dni: '123456' }), {
      nombre: 'Ingresá un nombre válido.',
      dni: DNI_VALIDATION_ERROR,
    });
    assert.deepEqual(validatePerfilOperativo({ nombre: 'Lucia', apellido: 'Gomez', dni: '' }), {});
    assert.deepEqual(validatePerfilOperativo({ nombre: 'Lucia', apellido: 'Gomez', dni: '32123456' }), {});
  });

  it('UI y AppRoutes mantienen contratos PBAC y self-protection de Fase 2', () => {
    const root = path.resolve(import.meta.dirname, '..');

    const personalTable = fs.readFileSync(
      path.join(root, 'src/features/recepcion/components/PersonalCentroTable.tsx'),
      'utf8'
    );
    assert.ok(personalTable.includes('{self ? ('), 'PersonalCentroTable must block self Permisos link');
    assert.ok(personalTable.includes('disabled'), 'Self Permisos button must be disabled');

    const padronPage = fs.readFileSync(
      path.join(root, 'src/features/recepcion/PadronPacientesPage.tsx'),
      'utf8'
    );
    assert.ok(padronPage.includes("can('PACIENTES_REGISTRAR')"));
    assert.ok(padronPage.includes("user?.rol === 'MEDICO'"));

    const routesSource = fs.readFileSync(path.join(root, 'src/routes/AppRoutes.tsx'), 'utf8');
    assert.ok(routesSource.includes("PermissionGuard anyOf={['USUARIOS_ADMINISTRAR']}"));
    assert.ok(routesSource.includes("PermissionGuard anyOf={['CONSULTORIOS_ADMINISTRAR']}"));
    assert.ok(routesSource.includes("PermissionGuard anyOf={['REPORTES_VER']}"));
  });
});
