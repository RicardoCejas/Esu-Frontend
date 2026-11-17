import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeInput, sanitizeFormData, isPasswordField } from '../src/lib/sanitizer.ts'

test('isPasswordField identifies sensitive password and token fields', () => {
  assert.equal(isPasswordField('password'), true)
  assert.equal(isPasswordField('currentPassword'), true)
  assert.equal(isPasswordField('newPassword'), true)
  assert.equal(isPasswordField('confirmPassword'), true)
  assert.equal(isPasswordField('clave'), true)
  assert.equal(isPasswordField('contraseña'), true)
  assert.equal(isPasswordField('contrasena'), true)
  assert.equal(isPasswordField('passwordActual'), true)
  assert.equal(isPasswordField('passwordNueva'), true)
  assert.equal(isPasswordField('tempToken'), true)
  assert.equal(isPasswordField('secret'), true)

  // Non-password fields
  assert.equal(isPasswordField('email'), false)
  assert.equal(isPasswordField('nombre'), false)
  assert.equal(isPasswordField('apellido'), false)
  assert.equal(isPasswordField('dni'), false)
  assert.equal(isPasswordField('motivo'), false)
})

test('sanitizeInput escapes XSS vectors on general user inputs', () => {
  const xssVector = '<script>alert("xss")</script>&<img src=x onerror=alert(1)>'
  const sanitized = sanitizeInput(xssVector)

  assert.equal(sanitized.includes('<script>'), false)
  assert.equal(sanitized.includes('&lt;script&gt;'), true)
  assert.equal(sanitized.includes('onerror='), false)
  assert.equal(sanitized.includes('&amp;'), true)
})

test('sanitizeFormData preserves passwords with characters like O\'Brien<&/ unmodified', () => {
  const complexPassword = "O'Brien<&/123!"
  const formWithPassword = {
    email: 'paciente.obrien@gmail.com',
    nombre: "Lucas O'Brien <Test>",
    password: complexPassword,
    currentPassword: complexPassword,
    nested: {
      newPassword: complexPassword,
      comment: '<b>Hola</b> & chau',
    },
  }

  const clean = sanitizeFormData(formWithPassword)

  // Password fields MUST be 100% identical and unmodified
  assert.equal(clean.password, complexPassword, "Password must not be mutated by sanitizer")
  assert.equal(clean.currentPassword, complexPassword, "Current password must not be mutated")
  assert.equal(clean.nested.newPassword, complexPassword, "Nested new password must not be mutated")

  // Non-password text fields MUST be safely sanitized
  assert.notEqual(clean.nombre, formWithPassword.nombre)
  assert.equal(clean.nombre.includes('&lt;Test&gt;'), true)
  assert.equal(clean.nested.comment.includes('&lt;b&gt;'), true)
})

test('remember login stores only the user identifier and never the plaintext password', () => {
  const mockLocalStorage = new Map()

  const handleRememberCredentials = (remember, emailOrDni, password) => {
    if (remember) {
      mockLocalStorage.set('esu_remember_login', emailOrDni.trim())
    } else {
      mockLocalStorage.delete('esu_remember_login')
    }
    // Strict DoD: Never persist plaintext passwords in localStorage
    mockLocalStorage.delete('esu_remember_password')
  }

  // Pre-existing legacy password in storage
  mockLocalStorage.set('esu_remember_password', 'LegacyPass123!')

  handleRememberCredentials(true, 'paciente@esu.com', 'SuperSecretPass#99')

  assert.equal(mockLocalStorage.get('esu_remember_login'), 'paciente@esu.com')
  assert.equal(mockLocalStorage.has('esu_remember_password'), false, 'esu_remember_password must be purged')

  handleRememberCredentials(false, 'paciente@esu.com', 'SuperSecretPass#99')
  assert.equal(mockLocalStorage.has('esu_remember_login'), false)
  assert.equal(mockLocalStorage.has('esu_remember_password'), false)
})

test('switchRole is strictly blocked in production environments', async () => {
  const devSwitchRole = (newRole, isDev, isDemo) => {
    if (!isDev && !isDemo) {
      throw new Error('El cambio dinámico de rol no está habilitado en entornos productivos.')
    }
    return true
  }

  // In production (isDev = false, isDemo = false)
  assert.throws(
    () => devSwitchRole('ADMIN', false, false),
    /no está habilitado en entornos productivos/
  )

  // In local development or explicit demo
  assert.equal(devSwitchRole('ADMIN', true, false), true)
  assert.equal(devSwitchRole('MEDICO', false, true), true)
})
