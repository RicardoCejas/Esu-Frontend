import test from 'node:test'
import assert from 'node:assert/strict'
import { isBackendProfessionalId, isBookableSlot, parseAvailabilityResponse } from '../src/features/turnero/availability.ts'

test('availability requests require a persisted backend professional identifier', () => {
  assert.equal(isBackendProfessionalId('42'), true)
  assert.equal(isBackendProfessionalId('doc-fernandez'), false)
  assert.equal(isBackendProfessionalId(''), false)
  assert.equal(isBackendProfessionalId('0'), false)
})

test('availability adapter accepts a list of typed appointment slots', () => {
  assert.deepEqual(
    parseAvailabilityResponse([
      { id: 'slot-1', time: '10:30', period: 'MORNING', isAvailable: true },
      { id: 'slot-2', time: '16:00', period: 'AFTERNOON', isAvailable: false },
    ]),
    [
      { id: 'slot-1', time: '10:30', period: 'MORNING', isAvailable: true },
      { id: 'slot-2', time: '16:00', period: 'AFTERNOON', isAvailable: false },
    ],
  )
})

test('availability adapter rejects an undocumented response shape', () => {
  assert.throws(() => parseAvailabilityResponse({ slots: [] }), /formato de disponibilidad/)
  assert.throws(() => parseAvailabilityResponse([
    { id: 'slot-invalid', time: '25:90', period: 'MORNING', isAvailable: true },
  ]), /formato de disponibilidad/)
})

test('past and occupied slots cannot be booked', () => {
  assert.equal(isBookableSlot({ id: 'a', time: '09:00', period: 'MORNING', isAvailable: true }, '2026-10-06', new Date(2026, 9, 7, 8)), false)
  assert.equal(isBookableSlot({ id: 'b', time: '07:30', period: 'MORNING', isAvailable: true }, '2026-10-07', new Date(2026, 9, 7, 8)), false)
  assert.equal(isBookableSlot({ id: 'c', time: '09:00', period: 'MORNING', isAvailable: false }, '2026-10-08', new Date(2026, 9, 7, 8)), false)
  assert.equal(isBookableSlot({ id: 'd', time: '09:00', period: 'MORNING', isAvailable: true }, '2026-10-08', new Date(2026, 9, 7, 8)), true)
  assert.equal(isBookableSlot({ id: 'e', time: '09:00', period: 'MORNING', isAvailable: true }, '2026-02-30', new Date(2026, 1, 1, 8)), false)
})
