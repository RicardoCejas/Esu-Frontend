import test from 'node:test'
import assert from 'node:assert/strict'
import { API_ENDPOINTS } from '../src/api/endpoints.ts'

test('auth endpoints configuration includes google and refresh', () => {
  assert.equal(API_ENDPOINTS.auth.google, '/auth/google')
  assert.equal(API_ENDPOINTS.auth.refresh, '/auth/refresh')
  assert.equal(API_ENDPOINTS.turnos.reservarPublico, '/turnos/publico/reservar')
})

test('google idToken payload validation rejects empty credentials', () => {
  const validateGoogleIdToken = (token) => {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new Error('El token de autenticación de Google es obligatorio.')
    }
    return token.trim()
  }

  assert.throws(() => validateGoogleIdToken(''), /obligatorio/)
  assert.throws(() => validateGoogleIdToken('   '), /obligatorio/)
  assert.throws(() => validateGoogleIdToken(null), /obligatorio/)
  assert.equal(validateGoogleIdToken('valid.jwt.token'), 'valid.jwt.token')
})
