import test from 'node:test'
import assert from 'node:assert/strict'
import { canProceedToPatient, canSelectCenter, canSelectDate, canSelectDoctor, canSelectSpecialty } from '../src/features/turnero/bookingStepValidation.ts'
import { patientBookingSchema } from '../src/features/turnero/patientValidation.ts'

const center = { id: 'center-1' }
const specialty = { id: 'specialty-1' }
const doctor = { id: 'doctor-1' }
const slot = { id: 'slot-1', time: '10:30', period: 'MORNING', isAvailable: true }
const now = new Date(2026, 9, 14, 10, 0)
const patient = {
  dni: '38123456', firstName: 'Ana', lastName: 'Gómez',
  phone: '3549 123456', email: '', healthInsurance: 'Particular',
  affiliateNumber: '', notes: '',
}

for (const [name, candidate, options, expected] of [
  ['known center', center, [center], true],
  ['center missing from catalog', center, [], false],
  ['unknown center', { id: 'center-2' }, [center], false],
  ['blank center ID', { id: ' ' }, [{ id: ' ' }], false],
]) {
  test(`center validation handles ${name}`, () => {
    assert.equal(canSelectCenter(candidate, options), expected)
  })
}

for (const [name, selectedCenter, selectedSpecialty, options, expected] of [
  ['known specialty', center, specialty, [specialty], true],
  ['missing center', null, specialty, [specialty], false],
  ['missing specialty', center, null, [specialty], false],
  ['unknown specialty', center, { id: 'other' }, [specialty], false],
  ['blank specialty ID', center, { id: ' ' }, [{ id: ' ' }], false],
]) {
  test(`specialty validation handles ${name}`, () => {
    assert.equal(canSelectSpecialty(selectedCenter, selectedSpecialty, options), expected)
  })
}

for (const [name, selectedCenter, selectedSpecialty, selectedDoctor, options, expected] of [
  ['known doctor', center, specialty, doctor, [doctor], true],
  ['missing center', null, specialty, doctor, [doctor], false],
  ['missing specialty', center, null, doctor, [doctor], false],
  ['missing doctor', center, specialty, null, [doctor], false],
  ['unknown doctor', center, specialty, { id: 'other' }, [doctor], false],
  ['doctor missing from catalog', center, specialty, doctor, [], false],
]) {
  test(`doctor validation handles ${name}`, () => {
    assert.equal(canSelectDoctor(selectedCenter, selectedSpecialty, selectedDoctor, options), expected)
  })
}

for (const [name, date, expected] of [
  ['today', '2026-10-14', true],
  ['tomorrow', '2026-10-15', true],
  ['yesterday', '2026-10-13', false],
  ['empty date', '', false],
  ['non-padded month', '2026-1-14', false],
  ['non-padded day', '2026-10-4', false],
  ['invalid month', '2026-00-14', false],
  ['nonexistent day', '2026-11-31', false],
  ['valid leap day', '2028-02-29', true],
  ['invalid non-leap day', '2027-02-29', false],
]) {
  test(`date validation handles ${name}`, () => {
    assert.equal(canSelectDate(date, now), expected)
  })
}

for (const [name, selectedCenter, selectedSpecialty, selectedDoctor, date, selectedSlot, slots, expected] of [
  ['valid latest slot', center, specialty, doctor, '2026-10-14', slot, [slot], true],
  ['missing center', null, specialty, doctor, '2026-10-14', slot, [slot], false],
  ['missing specialty', center, null, doctor, '2026-10-14', slot, [slot], false],
  ['missing doctor', center, specialty, null, '2026-10-14', slot, [slot], false],
  ['missing slot', center, specialty, doctor, '2026-10-14', null, [slot], false],
  ['stale slot removed by refresh', center, specialty, doctor, '2026-10-14', slot, [], false],
  ['stale slot now occupied', center, specialty, doctor, '2026-10-14', slot, [{ ...slot, isAvailable: false }], false],
  ['elapsed slot', center, specialty, doctor, '2026-10-14', slot, [{ ...slot, time: '09:59' }], false],
  ['malformed date', center, specialty, doctor, '2026-02-30', slot, [slot], false],
]) {
  test(`patient progression handles ${name}`, () => {
    assert.equal(canProceedToPatient(selectedCenter, selectedSpecialty, selectedDoctor, date, selectedSlot, slots, now), expected)
  })
}

for (const [name, patch, expected] of [
  ['seven-digit DNI', { dni: '1234567' }, true],
  ['eight-digit DNI', { dni: '12345678' }, true],
  ['six-digit DNI', { dni: '123456' }, false],
  ['nine-digit DNI', { dni: '123456789' }, false],
  ['alphabetic DNI', { dni: '1234abcd' }, false],
  ['one-character first name', { firstName: 'A' }, false],
  ['two-character first name', { firstName: 'Al' }, true],
  ['whitespace-only last name', { lastName: '  ' }, false],
  ['valid optional email', { email: 'ana@example.com' }, true],
  ['invalid optional email', { email: 'ana@' }, false],
  ['phone with fewer than six digits', { phone: '123-45' }, false],
  ['phone with six digits', { phone: '123456' }, true],
  ['letters in phone', { phone: '123456abc' }, false],
  ['blank insurance', { healthInsurance: ' ' }, false],
  ['empty optional affiliate number', { affiliateNumber: '' }, true],
  ['omitted optional notes', { notes: undefined }, true],
]) {
  test(`patient schema handles ${name}`, () => {
    assert.equal(patientBookingSchema.safeParse({ ...patient, ...patch }).success, expected)
  })
}
