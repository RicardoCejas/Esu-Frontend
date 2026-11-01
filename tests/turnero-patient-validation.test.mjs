import test from 'node:test'
import assert from 'node:assert/strict'
import { patientBookingSchema } from '../src/features/turnero/patientValidation.ts'

const validPatient = {
  dni: '38123456',
  firstName: 'Ana',
  lastName: 'Gómez',
  phone: '3549 123456',
  email: '',
  healthInsurance: 'Particular (Sin cobertura)',
  affiliateNumber: '',
  notes: '',
}

test('patient validation accepts complete required data without optional email', () => {
  assert.equal(patientBookingSchema.safeParse(validPatient).success, true)
})

test('patient validation rejects missing or malformed required data', () => {
  for (const patch of [
    { dni: '' },
    { dni: '123abc' },
    { firstName: ' ' },
    { lastName: 'A' },
    { phone: 'abc' },
    { healthInsurance: '' },
    { email: 'invalid' },
  ]) {
    assert.equal(patientBookingSchema.safeParse({ ...validPatient, ...patch }).success, false)
  }
})
