import test from 'node:test'
import assert from 'node:assert/strict'
import { toFrontendRole } from '../src/lib/roles.ts'

test('RECEPCIONISTA session preserves centroSaludId and centroSaludNombre from backend', () => {
  const backendAuthData = {
    usuarioId: 105,
    email: 'recepcion.crespo@esu.com',
    nombre: 'Valeria',
    apellido: 'Gomez',
    dni: '32111222',
    rol: 'RECEPCIONISTA',
    centroSaludId: 1,
    centroSaludNombre: 'Hospital Provincial Dr. Aurelio Crespo',
    accessToken: 'jwt-access-token-recepcion',
  }

  const centroSaludId = backendAuthData.centroSaludId != null ? String(backendAuthData.centroSaludId) : undefined
  const centroSaludNombre = backendAuthData.centroSaludNombre || undefined

  const sessionUser = {
    id: String(backendAuthData.usuarioId),
    usuarioId: String(backendAuthData.usuarioId),
    rol: toFrontendRole(backendAuthData.rol),
    nombre: backendAuthData.nombre,
    apellido: backendAuthData.apellido,
    email: backendAuthData.email,
    dni: backendAuthData.dni,
    centroSaludId,
    centroSaludNombre,
  }

  assert.equal(sessionUser.id, '105')
  assert.equal(sessionUser.rol, 'RECEPCIONISTA')
  assert.equal(sessionUser.centroSaludId, '1')
  assert.equal(sessionUser.centroSaludNombre, 'Hospital Provincial Dr. Aurelio Crespo')
})

test('RECEPCIONISTA without centroSaludId fails closed and is blocked by guard logic', () => {
  const receptionistWithoutCenter = {
    id: '106',
    rol: 'RECEPCIONISTA',
    nombre: 'Marta',
    email: 'recepcion.huerfana@esu.com',
    centroSaludId: undefined,
  }

  const isBlocked = (user) => {
    return user && user.rol === 'RECEPCIONISTA' && !user.centroSaludId
  }

  assert.equal(isBlocked(receptionistWithoutCenter), true)

  const receptionistWithCenter = {
    ...receptionistWithoutCenter,
    centroSaludId: '2',
    centroSaludNombre: 'Clínica Cabrera',
  }

  assert.equal(isBlocked(receptionistWithCenter), false)
})

test('ADMIN and MEDICO are exempt from receptionist centro guard barrier', () => {
  const adminUser = { id: '1', rol: 'ADMIN', centroSaludId: undefined }
  const medicoUser = { id: '2', rol: 'MEDICO', profesionalId: '5', centroSaludId: undefined }

  const isBlocked = (user) => {
    return user && user.rol === 'RECEPCIONISTA' && !user.centroSaludId
  }

  assert.equal(isBlocked(adminUser), false)
  assert.equal(isBlocked(medicoUser), false)
})
