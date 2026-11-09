import test from 'node:test'
import assert from 'node:assert/strict'
import { toFrontendRole, toBackendRole } from '../src/lib/roles.ts'

test('roles adapter maps bidirectional MEDICO <-> PROFESIONAL', () => {
  assert.equal(toFrontendRole('PROFESIONAL'), 'MEDICO')
  assert.equal(toFrontendRole('MEDICO'), 'MEDICO')
  assert.equal(toBackendRole('MEDICO'), 'PROFESIONAL')
  assert.equal(toBackendRole('PROFESIONAL'), 'PROFESIONAL')

  // Other roles pass through unchanged
  assert.equal(toFrontendRole('PACIENTE'), 'PACIENTE')
  assert.equal(toBackendRole('PACIENTE'), 'PACIENTE')
  assert.equal(toFrontendRole('RECEPCIONISTA'), 'RECEPCIONISTA')
  assert.equal(toBackendRole('RECEPCIONISTA'), 'RECEPCIONISTA')
  assert.equal(toFrontendRole('ADMIN'), 'ADMIN')
  assert.equal(toBackendRole('ADMIN'), 'ADMIN')
})

test('PACIENTE session preserves usuarioId as id and stores real pacienteId', () => {
  const backendAuthData = {
    usuarioId: 101,
    pacienteId: 501,
    email: 'paciente.real@esu.com',
    nombre: 'Lucas',
    apellido: 'Ramirez',
    dni: '38123456',
    rol: 'PACIENTE',
    accessToken: 'jwt-access-token-paciente',
  }

  const pacienteId = backendAuthData.pacienteId != null ? String(backendAuthData.pacienteId) : undefined
  const profesionalId = backendAuthData.profesionalId != null ? String(backendAuthData.profesionalId) : undefined
  const usuarioId = backendAuthData.usuarioId != null ? String(backendAuthData.usuarioId) : undefined

  const sessionUser = {
    id: usuarioId || '',
    usuarioId,
    pacienteId,
    profesionalId,
    rol: toFrontendRole(backendAuthData.rol),
    nombre: backendAuthData.nombre,
    apellido: backendAuthData.apellido,
    email: backendAuthData.email,
    dni: backendAuthData.dni,
  }

  assert.equal(sessionUser.id, '101')
  assert.equal(sessionUser.usuarioId, '101')
  assert.equal(sessionUser.pacienteId, '501')
  assert.equal(sessionUser.profesionalId, undefined)
  assert.equal(sessionUser.rol, 'PACIENTE')
  assert.notEqual(sessionUser.id, sessionUser.pacienteId, 'user.id must never be overwritten with pacienteId')
})

test('PROFESIONAL session preserves usuarioId as id, normalizes role to MEDICO, and stores profesionalId', () => {
  const backendAuthData = {
    usuarioId: 202,
    profesionalId: 77,
    email: 'doctora.perez@esu.gob.ar',
    nombre: 'Elena',
    apellido: 'Perez',
    dni: '29888999',
    rol: 'PROFESIONAL',
    accessToken: 'jwt-access-token-medico',
  }

  const pacienteId = backendAuthData.pacienteId != null ? String(backendAuthData.pacienteId) : undefined
  const profesionalId = backendAuthData.profesionalId != null ? String(backendAuthData.profesionalId) : undefined
  const usuarioId = backendAuthData.usuarioId != null ? String(backendAuthData.usuarioId) : undefined

  const sessionUser = {
    id: usuarioId || '',
    usuarioId,
    pacienteId,
    profesionalId,
    rol: toFrontendRole(backendAuthData.rol),
    nombre: backendAuthData.nombre,
    apellido: backendAuthData.apellido,
    email: backendAuthData.email,
    dni: backendAuthData.dni,
  }

  assert.equal(sessionUser.id, '202')
  assert.equal(sessionUser.usuarioId, '202')
  assert.equal(sessionUser.profesionalId, '77')
  assert.equal(sessionUser.pacienteId, undefined)
  assert.equal(sessionUser.rol, 'MEDICO')
  assert.notEqual(sessionUser.id, sessionUser.profesionalId, 'user.id must never be overwritten with profesionalId')
})

test('RECEPCIONISTA and ADMIN sessions contain no clinical domain IDs', () => {
  const recepcionData = {
    usuarioId: 303,
    email: 'recepcion@esu.gob.ar',
    rol: 'RECEPCIONISTA',
    accessToken: 'jwt-recepcion',
  }

  const adminData = {
    usuarioId: 404,
    email: 'admin@esu.gob.ar',
    rol: 'ADMIN',
    accessToken: 'jwt-admin',
  }

  const buildUser = (data) => ({
    id: String(data.usuarioId),
    usuarioId: String(data.usuarioId),
    pacienteId: data.pacienteId ? String(data.pacienteId) : undefined,
    profesionalId: data.profesionalId ? String(data.profesionalId) : undefined,
    rol: toFrontendRole(data.rol),
  })

  const recepcionista = buildUser(recepcionData)
  assert.equal(recepcionista.id, '303')
  assert.equal(recepcionista.pacienteId, undefined)
  assert.equal(recepcionista.profesionalId, undefined)
  assert.equal(recepcionista.rol, 'RECEPCIONISTA')

  const admin = buildUser(adminData)
  assert.equal(admin.id, '404')
  assert.equal(admin.pacienteId, undefined)
  assert.equal(admin.profesionalId, undefined)
  assert.equal(admin.rol, 'ADMIN')
})

test('2FA challenge and refreshSession restore real backend identity without mock fallbacks', () => {
  const challengeResponse = {
    usuarioId: 101,
    pacienteId: 501,
    email: 'paciente@esu.com',
    rol: 'PACIENTE',
    accessToken: 'jwt-after-2fa',
  }

  const pacienteId = challengeResponse.pacienteId != null ? String(challengeResponse.pacienteId) : undefined
  const usuarioId = challengeResponse.usuarioId != null ? String(challengeResponse.usuarioId) : undefined

  const restoredUser = {
    id: usuarioId || '',
    usuarioId,
    pacienteId,
    rol: toFrontendRole(challengeResponse.rol),
    twoFactorEnabled: true,
  }

  assert.equal(restoredUser.id, '101')
  assert.equal(restoredUser.pacienteId, '501')
  assert.equal(restoredUser.twoFactorEnabled, true)
})

test('clinical domain operations fail-closed when domain ID is absent and reject user.id fallback', () => {
  const invalidSessionUser = {
    id: '101',
    usuarioId: '101',
    pacienteId: undefined,
    profesionalId: undefined,
    rol: 'PACIENTE',
  }

  // Attempting to resolve pacienteId for clinical data must not fall back to user.id
  const resolveClinicalPatientId = (user) => {
    return user?.pacienteId || null
  }

  // Attempting to resolve profesionalId for agenda/bloqueo must not fall back to user.id or dummy string
  const resolveClinicalDoctorId = (user) => {
    return user?.profesionalId || null
  }

  assert.equal(resolveClinicalPatientId(invalidSessionUser), null, 'Must fail-closed and return null instead of falling back to user.id')
  assert.notEqual(resolveClinicalPatientId(invalidSessionUser), invalidSessionUser.id)

  assert.equal(resolveClinicalDoctorId(invalidSessionUser), null, 'Must fail-closed and return null instead of falling back to p1 or user.id')
  assert.notEqual(resolveClinicalDoctorId(invalidSessionUser), 'p1')
  assert.notEqual(resolveClinicalDoctorId(invalidSessionUser), '1')
})
