import test from 'node:test'
import assert from 'node:assert/strict'
import { formatLocalDate, isBackendProfessionalId, isBookableSlot, parseAvailabilityResponse } from '../src/features/turnero/availability.ts'

const validSlot = { id: 'slot-1', time: '10:30', period: 'MORNING', isAvailable: true }
const now = new Date(2026, 9, 14, 10, 0)

for (const [name, id, expected] of [
  ['single-digit persisted professional ID', '1', true],
  ['multi-digit persisted professional ID', '123456', true],
  ['zero professional ID', '0', false],
  ['leading-zero professional ID', '01', false],
  ['negative professional ID', '-1', false],
  ['decimal professional ID', '1.5', false],
  ['whitespace in professional ID', ' 1', false],
  ['scientific-notation professional ID', '1e3', false],
  ['mock professional slug', 'doc-fernandez', false],
]) {
  test(`availability identifies ${name}`, () => {
    assert.equal(isBackendProfessionalId(id), expected)
  })
}

for (const [name, value] of [
  ['null payload', null],
  ['object wrapper', { slots: [] }],
  ['string payload', '[]'],
  ['null slot', [null]],
  ['missing slot ID', [{ time: '10:30', period: 'MORNING', isAvailable: true }]],
  ['numeric slot ID', [{ ...validSlot, id: 12 }]],
  ['missing time', [{ id: 'slot-1', period: 'MORNING', isAvailable: true }]],
  ['numeric time', [{ ...validSlot, time: 1030 }]],
  ['invalid hour', [{ ...validSlot, time: '24:00' }]],
  ['invalid minute', [{ ...validSlot, time: '10:60' }]],
  ['single-digit hour', [{ ...validSlot, time: '9:30' }]],
  ['unsupported period', [{ ...validSlot, period: 'EVENING' }]],
  ['missing availability flag', [{ id: 'slot-1', time: '10:30', period: 'MORNING' }]],
  ['string availability flag', [{ ...validSlot, isAvailable: 'true' }]],
]) {
  test(`availability rejects ${name}`, () => {
    assert.throws(() => parseAvailabilityResponse(value), /formato|horario/)
  })
}

for (const [name, value, expected] of [
  ['empty slot list', [], []],
  ['midnight slot', [{ ...validSlot, time: '00:00' }], [{ ...validSlot, time: '00:00' }]],
  ['last minute of day', [{ ...validSlot, time: '23:59' }], [{ ...validSlot, time: '23:59' }]],
  ['unavailable slot', [{ ...validSlot, isAvailable: false }], [{ ...validSlot, isAvailable: false }]],
]) {
  test(`availability parses ${name}`, () => {
    assert.deepEqual(parseAvailabilityResponse(value), expected)
  })
}

for (const [name, slot, date, clock, expected] of [
  ['future available slot', validSlot, '2026-10-15', now, true],
  ['future occupied slot', { ...validSlot, isAvailable: false }, '2026-10-15', now, false],
  ['past available slot', validSlot, '2026-10-13', now, false],
  ['today later slot', validSlot, '2026-10-14', now, true],
  ['today elapsed slot', { ...validSlot, time: '09:59' }, '2026-10-14', now, false],
  ['today current-minute slot', { ...validSlot, time: '10:00' }, '2026-10-14', now, false],
  ['today one-minute-later slot', { ...validSlot, time: '10:01' }, '2026-10-14', now, true],
  ['today occupied later slot', { ...validSlot, isAvailable: false }, '2026-10-14', now, false],
  ['malformed date', validSlot, '14-10-2026', now, false],
  ['nonexistent day', validSlot, '2026-02-30', now, false],
  ['invalid month', validSlot, '2026-13-01', now, false],
  ['invalid slot time', { ...validSlot, time: '25:00' }, '2026-10-15', now, false],
  ['midnight at midnight', { ...validSlot, time: '00:00' }, '2026-10-14', new Date(2026, 9, 14, 0, 0), false],
  ['day after leap day', validSlot, '2028-02-29', new Date(2028, 1, 28, 12), true],
]) {
  test(`bookability handles ${name}`, () => {
    assert.equal(isBookableSlot(slot, date, clock), expected)
  })
}

test('local date formatter does not convert a late local time into UTC date', () => {
  assert.equal(formatLocalDate(new Date(2026, 9, 14, 23, 59)), '2026-10-14')
})
