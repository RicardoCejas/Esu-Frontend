import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoBookingStore, DEMO_SCHEDULE } from '../src/features/turnero/demoBookingStore.ts'

const doctor = { id: 'doc-1', specialtyId: 'esp-clinica', centerIds: ['center-1'], availableDays: ['Lunes'] }
const patient = { dni: '38123456', firstName: 'Ana', lastName: 'Pérez', phone: '3549123456', email: '', healthInsurance: 'Particular (Sin cobertura)', affiliateNumber: '' }
const now = new Date(2026, 9, 11, 12)

test('demo schedule follows doctor days and configurable project slot defaults', () => {
  const store = createDemoBookingStore()
  assert.equal(DEMO_SCHEDULE.morning[0].time, '08:00')
  assert.equal(store.getSlots(doctor, '2026-10-13', now).length, 0)
  const slots = store.getSlots(doctor, '2026-10-12', now)
  assert.equal(slots[0].time, '08:00')
  assert.equal(slots.find((slot) => slot.time === '09:00').isAvailable, false)
})

test('shared in-memory demo store rejects duplicate doctor/time even across centers', () => {
  const store = createDemoBookingStore()
  const selection = { centerId: 'center-1', specialtyId: 'esp-clinica', doctor, date: '2026-10-12', slotId: 'slot-m1', patient }
  const booking = store.book(selection, now)
  assert.match(booking.code, /^DEMO-/)
  assert.equal(store.getSlots(doctor, '2026-10-12', now).find((slot) => slot.id === 'slot-m1').isAvailable, false)
  assert.throws(() => store.book(selection, now), /ya no está disponible/)
  assert.throws(() => store.book({ ...selection, centerId: 'center-2' }, now), /centro/)
})

test('demo reminder is calculated 24 hours before appointment and invalid input is rejected', () => {
  const store = createDemoBookingStore()
  const booking = store.book({ centerId: 'center-1', specialtyId: 'esp-clinica', doctor, date: '2026-10-12', slotId: 'slot-m1', patient }, now)
  assert.equal(booking.reminderAt.getTime(), booking.appointmentAt.getTime() - 24 * 60 * 60 * 1000)
  assert.throws(() => store.book({ centerId: 'center-1', specialtyId: 'esp-clinica', doctor, date: '2026-10-19', slotId: 'slot-m2', patient: { ...patient, dni: '' } }, now), /paciente/)
})
