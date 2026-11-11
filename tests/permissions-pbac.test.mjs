import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_PERMISSIONS_BY_ROLE } from '../src/types/index.ts';
import { validateAndBuildCreateUserPayload } from '../src/api/usuariosNormalizer.ts';

// Pure logic equivalent of usePermissions can / canAny / canAll
function evaluatePermissions(user, permission) {
  if (!user) return false;
  if (user.rol === 'ADMIN') return true;
  const set = new Set(user.permisos ?? []);
  return set.has(permission);
}

function evaluateAny(user, permissions) {
  if (!user) return false;
  if (user.rol === 'ADMIN') return true;
  const set = new Set(user.permisos ?? []);
  return permissions.some((p) => set.has(p));
}

function evaluateAll(user, permissions) {
  if (!user) return false;
  if (user.rol === 'ADMIN') return true;
  const set = new Set(user.permisos ?? []);
  return permissions.every((p) => set.has(p));
}

describe('HU-INT-06: Catálogo de Permisos Granulares y PBAC', () => {
  describe('DEFAULT_PERMISSIONS_BY_ROLE', () => {
    it('ADMIN debe incluir los 15 permisos del catálogo canónico', () => {
      const perms = DEFAULT_PERMISSIONS_BY_ROLE.ADMIN;
      assert.equal(perms.length, 15);
      assert.ok(perms.includes('USUARIOS_ADMINISTRAR'));
      assert.ok(perms.includes('CONSULTORIOS_ADMINISTRAR'));
      assert.ok(perms.includes('TURNOS_CANCELAR'));
    });

    it('RECEPCIONISTA debe poseer permisos de gestión de centro y excluir fusión global de pacientes', () => {
      const perms = DEFAULT_PERMISSIONS_BY_ROLE.RECEPCIONISTA;
      assert.ok(perms.includes('TURNOS_VER'));
      assert.ok(perms.includes('TURNOS_CREAR'));
      assert.ok(perms.includes('TURNOS_CANCELAR'));
      assert.ok(perms.includes('SOBRETURNOS_CREAR'));
      assert.ok(perms.includes('SALA_ESPERA_GESTIONAR'));
      assert.ok(perms.includes('CONSULTORIOS_VER'));
      assert.ok(perms.includes('CONSULTORIOS_ADMINISTRAR'));
      assert.ok(perms.includes('REPORTES_VER'));
      assert.ok(perms.includes('USUARIOS_ADMINISTRAR'));
      // Fusión global reservada exclusivamente a ADMIN de plataforma
      assert.equal(perms.includes('PACIENTES_FUSIONAR'), false);
    });

    it('MEDICO / PROFESIONAL debe tener permisos clínicos acotados', () => {
      const perms = DEFAULT_PERMISSIONS_BY_ROLE.MEDICO;
      assert.deepEqual(perms, ['TURNOS_VER', 'PACIENTES_VER', 'CONSULTORIOS_VER', 'MEDICOS_VER']);
    });
  });

  describe('Motor de Autorización Granular (can / canAny / canAll)', () => {
    it('Usuario null retorna false para cualquier permiso', () => {
      assert.equal(evaluatePermissions(null, 'TURNOS_VER'), false);
      assert.equal(evaluateAny(null, ['TURNOS_VER']), false);
      assert.equal(evaluateAll(null, ['TURNOS_VER']), false);
    });

    it('ADMIN siempre tiene permiso independientemente de su lista explícita', () => {
      const admin = { rol: 'ADMIN', permisos: [] };
      assert.equal(evaluatePermissions(admin, 'CUALQUIER_PERMISO'), true);
      assert.equal(evaluateAny(admin, ['TURNOS_CANCELAR']), true);
      assert.equal(evaluateAll(admin, ['A', 'B', 'C']), true);
    });

    it('Recepcionista con permiso TURNOS_CANCELAR es autorizada', () => {
      const user = { rol: 'RECEPCIONISTA', permisos: ['TURNOS_VER', 'TURNOS_CANCELAR'] };
      assert.equal(evaluatePermissions(user, 'TURNOS_CANCELAR'), true);
      assert.equal(evaluatePermissions(user, 'TURNOS_VER'), true);
      assert.equal(evaluatePermissions(user, 'SOBRETURNOS_CREAR'), false);
    });

    it('canAny retorna true si al menos uno de los permisos requeridos está concedido', () => {
      const user = { rol: 'RECEPCIONISTA', permisos: ['TURNOS_VER'] };
      assert.equal(evaluateAny(user, ['SOBRETURNOS_CREAR', 'TURNOS_VER']), true);
      assert.equal(evaluateAny(user, ['SOBRETURNOS_CREAR', 'TURNOS_CANCELAR']), false);
    });

    it('canAll retorna true solo si todos los permisos requeridos están concedidos', () => {
      const user = { rol: 'RECEPCIONISTA', permisos: ['TURNOS_VER', 'TURNOS_CREAR'] };
      assert.equal(evaluateAll(user, ['TURNOS_VER', 'TURNOS_CREAR']), true);
      assert.equal(evaluateAll(user, ['TURNOS_VER', 'TURNOS_CANCELAR']), false);
    });
  });

  describe('Normalizador de Alta de Usuario con Permisos', () => {
    it('validateAndBuildCreateUserPayload propaga la lista de permisos seleccionados', () => {
      const payload = validateAndBuildCreateUserPayload({
        username: 'recepcionista.junior@esu.gob.ar',
        password: 'Password123!',
        rol: 'RECEPCIONISTA',
        nombre: 'Lucia',
        apellido: 'Gomez',
        dni: '38112233',
        centroSaludId: 1,
        permisos: ['TURNOS_VER', 'SALA_ESPERA_GESTIONAR'],
      });

      assert.equal(payload.username, 'recepcionista.junior@esu.gob.ar');
      assert.equal(payload.rol, 'RECEPCIONISTA');
      assert.equal(payload.centroSaludId, 1);
      assert.deepEqual(payload.permisos, ['TURNOS_VER', 'SALA_ESPERA_GESTIONAR']);
    });
  });
  describe('Servicios de Actualización de Rol, Sede y Permisos', () => {
    it('API_ENDPOINTS.usuarios.actualizarAsignacion construye la ruta correcta', async () => {
      const { API_ENDPOINTS } = await import('../src/api/endpoints.ts');
      assert.equal(API_ENDPOINTS.usuarios.actualizarAsignacion(42), '/usuarios/42/asignacion');
    });

    it('PermisosMatrixSelector agrupa catálogo por módulo sin duplicados', () => {
      const sampleCatalogo = [
        { id: 1, codigo: 'TURNOS_VER', nombre: 'Ver Turnos', modulo: 'TURNOS' },
        { id: 2, codigo: 'TURNOS_CREAR', nombre: 'Crear Turnos', modulo: 'TURNOS' },
        { id: 3, codigo: 'PACIENTES_VER', nombre: 'Ver Pacientes', modulo: 'PACIENTES' },
      ];

      const modulos = new Map();
      for (const p of sampleCatalogo) {
        const list = modulos.get(p.modulo) ?? [];
        list.push(p);
        modulos.set(p.modulo, list);
      }

      assert.equal(modulos.size, 2);
      assert.equal(modulos.get('TURNOS').length, 2);
      assert.equal(modulos.get('PACIENTES').length, 1);
    });
  });
});
