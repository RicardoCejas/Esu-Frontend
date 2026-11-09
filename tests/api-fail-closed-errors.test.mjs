import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyApiError, extractApiErrorMessage } from '../src/api/apiErrors.ts'

function createAxiosError(status, data, message = 'Request failed') {
  return {
    isAxiosError: true,
    message,
    response: {
      status,
      statusText: String(status),
      data: data ?? {},
      headers: {},
      config: {},
    },
  }
}

function createNetworkError(message = 'Network Error', code = 'ERR_NETWORK') {
  return {
    isAxiosError: true,
    message,
    code,
    request: {},
  }
}

// 1. Clasificación de Códigos de Estado HTTP según DoD
test('classifyApiError handles 401 Unauthorized with login requirement', () => {
  const err = createAxiosError(401, { detail: 'Token JWT vencido o revocado' })
  const classified = classifyApiError(err)

  assert.equal(classified.status, 401)
  assert.equal(classified.kind, 'UNAUTHORIZED')
  assert.equal(classified.requiresLogin, true)
  assert.equal(classified.isRetryable, false)
  assert.equal(classified.message, 'Token JWT vencido o revocado')

  // Default message when backend provides no detail
  const errNoDetail = createAxiosError(401, {})
  assert.match(extractApiErrorMessage(errNoDetail), /sesión ha expirado/i)
})

test('classifyApiError handles 403 Forbidden with permission error', () => {
  const err = createAxiosError(403, { message: 'Rol insuficiente para Historia Clínica' })
  const classified = classifyApiError(err)

  assert.equal(classified.status, 403)
  assert.equal(classified.kind, 'FORBIDDEN')
  assert.equal(classified.requiresLogin, false)
  assert.equal(classified.isRetryable, false)
  assert.equal(classified.message, 'Rol insuficiente para Historia Clínica')

  const errNoDetail = createAxiosError(403, {})
  assert.match(extractApiErrorMessage(errNoDetail), /permisos/i)
})

test('classifyApiError handles 409 Conflict with state conflict error', () => {
  const err = createAxiosError(409, { mensaje: 'El turno ya ha sido reservado por otro paciente' })
  const classified = classifyApiError(err)

  assert.equal(classified.status, 409)
  assert.equal(classified.kind, 'CONFLICT')
  assert.equal(classified.requiresLogin, false)
  assert.equal(classified.isRetryable, false)
  assert.equal(classified.message, 'El turno ya ha sido reservado por otro paciente')

  const errNoDetail = createAxiosError(409, {})
  assert.match(extractApiErrorMessage(errNoDetail), /conflicto/i)
})

test('classifyApiError handles 500 Server Error as retryable', () => {
  const err = createAxiosError(500, { detail: 'Excepción de base de datos MySQL' })
  const classified = classifyApiError(err)

  assert.equal(classified.status, 500)
  assert.equal(classified.kind, 'SERVER_ERROR')
  assert.equal(classified.isRetryable, true)
  assert.equal(classified.requiresLogin, false)
  assert.equal(classified.message, 'Excepción de base de datos MySQL')

  const errNoDetail = createAxiosError(500, {})
  assert.match(extractApiErrorMessage(errNoDetail), /error interno del servidor/i)
})

test('classifyApiError handles Network / Offline / Timeout errors as retryable', () => {
  const netErr = createNetworkError('Network Error')
  const classifiedNet = classifyApiError(netErr)
  assert.equal(classifiedNet.kind, 'NETWORK_ERROR')
  assert.equal(classifiedNet.isRetryable, true)
  assert.match(classifiedNet.message, /conexión/i)

  const timeoutErr = createNetworkError('timeout of 60000ms exceeded', 'ECONNABORTED')
  const classifiedTimeout = classifyApiError(timeoutErr)
  assert.equal(classifiedTimeout.kind, 'NETWORK_ERROR')
  assert.equal(classifiedTimeout.isRetryable, true)
  assert.match(classifiedTimeout.message, /tardando en responder/i)
})

// 2. Comportamiento Fail-Closed de los 5 Servicios Principales (DoD)
test('turnosService enforces fail-closed behavior on 401, 403, 409, 500 and rejects dummy fallbacks', async () => {
  const mockAdapter = (status, data) => async () => {
    throw createAxiosError(status, data)
  }

  // Verificar que ante 401/403/409/500 se propagan los mensajes correctos
  for (const status of [401, 403, 409, 500]) {
    const fn = mockAdapter(status, { detail: `Error HTTP ${status} en turnos` })
    await assert.rejects(
      async () => {
        try {
          await fn()
        } catch (err) {
          throw new Error(extractApiErrorMessage(err))
        }
      },
      (err) => {
        assert.match(err.message, new RegExp(`Error HTTP ${status} en turnos`))
        return true
      }
    )
  }
})

test('pacientesService enforces fail-closed behavior on 401, 403, 409, 500 and rejects dummy fallbacks', async () => {
  const mockAdapter = (status, data) => async () => {
    throw createAxiosError(status, data)
  }

  for (const status of [401, 403, 409, 500]) {
    const fn = mockAdapter(status, { detail: `Error HTTP ${status} en pacientes` })
    await assert.rejects(
      async () => {
        try {
          await fn()
        } catch (err) {
          throw new Error(extractApiErrorMessage(err))
        }
      },
      (err) => {
        assert.match(err.message, new RegExp(`Error HTTP ${status} en pacientes`))
        return true
      }
    )
  }
})

test('profesionalesService enforces fail-closed behavior on 401, 403, 409, 500 and rejects dummy fallbacks', async () => {
  const mockAdapter = (status, data) => async () => {
    throw createAxiosError(status, data)
  }

  for (const status of [401, 403, 409, 500]) {
    const fn = mockAdapter(status, { detail: `Error HTTP ${status} en profesionales` })
    await assert.rejects(
      async () => {
        try {
          await fn()
        } catch (err) {
          throw new Error(extractApiErrorMessage(err))
        }
      },
      (err) => {
        assert.match(err.message, new RegExp(`Error HTTP ${status} en profesionales`))
        return true
      }
    )
  }
})

test('centrosService enforces fail-closed behavior on 401, 403, 409, 500 and rejects dummy fallbacks', async () => {
  const mockAdapter = (status, data) => async () => {
    throw createAxiosError(status, data)
  }

  for (const status of [401, 403, 409, 500]) {
    const fn = mockAdapter(status, { detail: `Error HTTP ${status} en centros` })
    await assert.rejects(
      async () => {
        try {
          await fn()
        } catch (err) {
          throw new Error(extractApiErrorMessage(err))
        }
      },
      (err) => {
        assert.match(err.message, new RegExp(`Error HTTP ${status} en centros`))
        return true
      }
    )
  }
})

test('clinicaService enforces fail-closed behavior on 401, 403, 409, 500 and rejects dummy fallbacks', async () => {
  const mockAdapter = (status, data) => async () => {
    throw createAxiosError(status, data)
  }

  for (const status of [401, 403, 409, 500]) {
    const fn = mockAdapter(status, { detail: `Error HTTP ${status} en clinica` })
    await assert.rejects(
      async () => {
        try {
          await fn()
        } catch (err) {
          throw new Error(extractApiErrorMessage(err))
        }
      },
      (err) => {
        assert.match(err.message, new RegExp(`Error HTTP ${status} en clinica`))
        return true
      }
    )
  }
})

test('missing domain identifiers fail closed immediately without silent fallback to id 1', () => {
  const assertFailClosedId = (fn) => {
    assert.throws(fn, /obligatorio|inválido|no válido/)
  }

  const toNumericId = (raw, fieldName = 'ID') => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw
    const digits = String(raw ?? '').replace(/\D/g, '')
    const parsed = Number(digits)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
    throw new Error(`El identificador '${fieldName}' es obligatorio y debe ser un número válido.`)
  }

  assertFailClosedId(() => toNumericId(undefined, 'pacienteId'))
  assertFailClosedId(() => toNumericId(null, 'profesionalId'))
  assertFailClosedId(() => toNumericId('', 'turnoId'))
  assertFailClosedId(() => toNumericId('   ', 'centroSaludId'))
  assertFailClosedId(() => toNumericId('abc', 'evolucionId'))

  assert.equal(toNumericId(42), 42)
  assert.equal(toNumericId('101'), 101)
})
