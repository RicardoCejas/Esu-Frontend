import test from 'node:test'
import assert from 'node:assert/strict'
import { createPersistedTurno } from '../src/api/turnoCreation.ts'

const request = {
  fechaHora: '2026-10-20T10:30:00',
  pacienteId: 12,
  profesionalId: 34,
}

const response = {
  id: 56,
  fechaHora: request.fechaHora,
  estado: 'PENDIENTE',
  paciente: { id: request.pacienteId },
  profesional: { id: request.profesionalId },
}

test('booking posts the backend DTO to the real creation endpoint', async () => {
  const calls = []
  const created = await createPersistedTurno(async (path, body) => {
    calls.push({ path, body })
    return { data: response }
  }, request)

  assert.deepEqual(calls, [{ path: '/turnos/crear', body: request }])
  assert.deepEqual(created, response)
})

test('booking accepts equivalent backend local date-time precision but not a different appointment time', async () => {
  const sameTime = await createPersistedTurno(async () => ({
    data: { ...response, fechaHora: '2026-10-20T10:30' },
  }), request)
  assert.equal(sameTime.id, response.id)

  const fractionalTime = await createPersistedTurno(async () => ({
    data: { ...response, fechaHora: '2026-10-20T10:30:00.000' },
  }), request)
  assert.equal(fractionalTime.id, response.id)

  await assert.rejects(createPersistedTurno(async () => ({
    data: { ...response, fechaHora: '2026-10-20T10:31' },
  }), request), /valid persisted appointment/)
})

test('booking does not invent a receipt when the request fails or the response is incomplete', async () => {
  await assert.rejects(createPersistedTurno(async () => {
    throw new Error('Network unavailable')
  }, request), /Network unavailable/)

  await assert.rejects(createPersistedTurno(async () => ({ data: { ...response, id: null } }), request), /valid persisted appointment/)
  await assert.rejects(createPersistedTurno(async () => ({ data: { ...response, paciente: { id: 99 } } }), request), /valid persisted appointment/)
})

test('booking rejects missing backend identifiers without a network call', async () => {
  let called = false
  await assert.rejects(createPersistedTurno(async () => {
    called = true
    return { data: response }
  }, { ...request, pacienteId: 0 }), /valid backend identifiers/)
  assert.equal(called, false)
})
