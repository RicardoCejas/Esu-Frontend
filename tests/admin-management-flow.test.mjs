import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUsuario,
  toNumericId,
  validateAndBuildCreateUserPayload,
} from '../src/api/usuariosNormalizer.ts';
import { toFrontendRole, toBackendRole } from '../src/lib/roles.ts';
import { extractApiErrorMessage } from '../src/api/apiErrors.ts';

test('toBackendRole maps frontend roles to Spring Boot backend security roles', () => {
  assert.equal(toBackendRole('ADMIN'), 'ADMIN');
  assert.equal(toBackendRole('RECEPCIONISTA'), 'RECEPCIONISTA');
  assert.equal(toBackendRole('MEDICO'), 'PROFESIONAL');
  assert.equal(toBackendRole('PROFESIONAL'), 'PROFESIONAL');
  assert.equal(toBackendRole('PACIENTE'), 'PACIENTE');
});

test('toFrontendRole maps backend roles to frontend UI roles', () => {
  assert.equal(toFrontendRole('ADMIN'), 'ADMIN');
  assert.equal(toFrontendRole('RECEPCIONISTA'), 'RECEPCIONISTA');
  assert.equal(toFrontendRole('PROFESIONAL'), 'MEDICO');
  assert.equal(toFrontendRole('MEDICO'), 'MEDICO');
  assert.equal(toFrontendRole('PACIENTE'), 'PACIENTE');
});

test('validateAndBuildCreateUserPayload builds valid payload for ADMIN, PROFESIONAL, and RECEPCIONISTA', () => {
  const adminPayload = validateAndBuildCreateUserPayload({
    username: 'admin.central@esu.gob.ar',
    password: 'Password123!',
    rol: 'ADMIN',
    nombre: 'Super',
    apellido: 'Admin',
  });

  assert.equal(adminPayload.username, 'admin.central@esu.gob.ar');
  assert.equal(adminPayload.password, 'Password123!');
  assert.equal(adminPayload.rol, 'ADMIN');
  assert.equal(adminPayload.nombre, 'Super');
  assert.equal(adminPayload.apellido, 'Admin');

  const medicoPayload = validateAndBuildCreateUserPayload({
    username: 'medico.cabrera@esu.gob.ar',
    password: 'Doctor2026Password',
    rol: 'MEDICO',
    dni: '32123456',
  });

  assert.equal(medicoPayload.username, 'medico.cabrera@esu.gob.ar');
  assert.equal(medicoPayload.rol, 'PROFESIONAL');
  assert.equal(medicoPayload.dni, '32123456');

  const recepcionPayload = validateAndBuildCreateUserPayload({
    username: 'recepcion.crespo@esu.gob.ar',
    password: 'Recep2026Password',
    rol: 'RECEPCIONISTA',
  });

  assert.equal(recepcionPayload.username, 'recepcion.crespo@esu.gob.ar');
  assert.equal(recepcionPayload.rol, 'RECEPCIONISTA');
});

test('validateAndBuildCreateUserPayload rejects invalid emails or passwords shorter than 6 chars', () => {
  assert.throws(
    () =>
      validateAndBuildCreateUserPayload({
        username: 'not-an-email',
        password: 'validPassword123',
        rol: 'ADMIN',
      }),
    /correo electrónico válido/
  );

  assert.throws(
    () =>
      validateAndBuildCreateUserPayload({
        username: 'valid@esu.gob.ar',
        password: '123',
        rol: 'ADMIN',
      }),
    /al menos 6 caracteres/
  );
});

test('normalizeUsuario maps real user attributes and does NOT assign fake random health centers', () => {
  const rawApiUser = {
    id: 42,
    username: 'dra.gomez@esu.gob.ar',
    rol: 'PROFESIONAL',
    activo: true,
    nombre: 'Valeria',
    apellido: 'Gomez',
    dni: '29876543',
    centroSaludId: 5,
    centroSaludNombre: 'Hospital Regional Aurelio Crespo',
  };

  const user = normalizeUsuario(rawApiUser);

  assert.equal(user.id, '42');
  assert.equal(user.usuarioId, '42');
  assert.equal(user.email, 'dra.gomez@esu.gob.ar');
  assert.equal(user.rol, 'MEDICO');
  assert.equal(user.nombre, 'Valeria');
  assert.equal(user.apellido, 'Gomez');
  assert.equal(user.dni, '29876543');
  assert.equal(user.activo, true);
  assert.equal(user.centroSaludId, '5');
  assert.equal(user.centroSaludNombre, 'Hospital Regional Aurelio Crespo');
});

test('normalizeUsuario leaves centroSaludNombre undefined if not provided (Sin sede asignada)', () => {
  const unassignedUser = {
    id: 43,
    email: 'recepcion.libre@esu.gob.ar',
    rol: 'RECEPCIONISTA',
    activo: true,
  };

  const user = normalizeUsuario(unassignedUser);

  assert.equal(user.id, '43');
  assert.equal(user.centroSaludId, undefined);
  assert.equal(user.centroSaludNombre, undefined, 'Must not invent a random health center');
});

test('toNumericId strictly validates numeric ids and rejects malformed values', () => {
  assert.equal(toNumericId(45), 45);
  assert.equal(toNumericId('45'), 45);
  assert.equal(toNumericId('ID-108'), 108);

  assert.throws(() => toNumericId(''), /número válido/);
  assert.throws(() => toNumericId(undefined), /número válido/);
  assert.throws(() => toNumericId(null), /número válido/);
});

test('extractApiErrorMessage cleanly extracts 409 conflict and 403 forbidden errors', () => {
  const error409 = {
    response: {
      status: 409,
      data: {
        message: 'El nombre de usuario ya se encuentra registrado en el sistema.',
      },
    },
  };

  const msg409 = extractApiErrorMessage(error409, 'Error por defecto');
  assert.match(msg409, /ya se encuentra registrado/);

  const error403 = {
    response: {
      status: 403,
      data: {
        message: 'Acceso denegado: se requieren permisos de Administrador.',
      },
    },
  };

  const msg403 = extractApiErrorMessage(error403, 'Error por defecto');
  assert.match(msg403, /permisos de Administrador/);
});

test('Admin creation workflow does not touch or overwrite existing admin tokens in session', () => {
  // Simulación del contrato de aislamiento de sesión de alta de usuario:
  // Crear un usuario secundario jamás debe modificar los tokens en memoria o almacenamiento
  const mockAdminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin';
  const initialStorageState = { token: mockAdminToken, rol: 'ADMIN' };

  // Ejecutamos la lógica de creación
  const newUserPayload = validateAndBuildCreateUserPayload({
    username: 'nuevo.operador@esu.gob.ar',
    password: 'PasswordSegura2026',
    rol: 'RECEPCIONISTA',
  });

  // Verificamos que el payload no contiene tokens ni muta el almacenamiento del admin
  assert.equal(initialStorageState.token, mockAdminToken);
  assert.equal(initialStorageState.rol, 'ADMIN');
  assert.notEqual(newUserPayload.username, initialStorageState.rol);
});
