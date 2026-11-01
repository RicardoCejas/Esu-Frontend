import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canSelectCenter,
  canSelectSpecialty,
  canSelectDoctor,
  canSelectDate,
  canProceedToPatient,
} from '../src/features/turnero/bookingStepValidation.ts'

const center = { id: 'center-1' }
const specialty = { id: 'specialty-1' }
const doctor = { id: 'doctor-1' }
const slot = { id: 'slot-1', time: '10:00', period: 'MORNING', isAvailable: true }
const now = new Date(2026, 9, 14, 9, 0)

test('selection steps reject missing or unknown center, specialty and doctor', () => {
  assert.equal(canSelectCenter(center, [center]), true)
  assert.equal(canSelectCenter(null, [center]), false)
  assert.equal(canSelectCenter({ id: 'unknown' }, [center]), false)
  assert.equal(canSelectSpecialty(center, specialty, [specialty]), true)
  assert.equal(canSelectSpecialty(null, specialty, [specialty]), false)
  assert.equal(canSelectSpecialty(center, { id: '' }, [specialty]), false)
  assert.equal(canSelectDoctor(center, specialty, doctor, [doctor]), true)
  assert.equal(canSelectDoctor(center, specialty, { id: 'unknown' }, [doctor]), false)
})

test('date and slot progression reject malformed, past, missing and unavailable data', () => {
  assert.equal(canSelectDate('2026-10-14', now), true)
  assert.equal(canSelectDate('2026-10-13', now), false)
  assert.equal(canSelectDate('2026-02-30', now), false)
  assert.equal(canProceedToPatient(center, specialty, doctor, '2026-10-14', slot, [slot], now), true)
  assert.equal(canProceedToPatient(center, specialty, doctor, '2026-10-14', null, [slot], now), false)
  assert.equal(canProceedToPatient(center, specialty, doctor, '2026-10-14', { ...slot, id: 'unknown' }, [slot], now), false)
  assert.equal(canProceedToPatient(center, specialty, doctor, '2026-10-14', slot, [{ ...slot, isAvailable: false }], now), false)
})
