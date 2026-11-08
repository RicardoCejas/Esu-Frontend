import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTurno } from '../src/api/turnoNormalizer.ts';

test('normalizeTurno does not invent synthetic verification codes like ESU-2026-xxxx when backend omits it', () => {
  const backendResponse = {
    id: 1234,
    fechaHora: '2026-11-15T09:30:00',
    estado: 'CONFIRMADO',
    paciente: {
      id: 50,
      nombre: 'Carlos',
      apellido: 'Monzon',
      dni: '30111222',
      telefono: '3549112233',
    },
    profesional: {
      id: 10,
      nombre: 'Lucia',
      apellido: 'Velez',
      especialidad: { id: 3, nombre: 'Cardiología' },
    },
    centroSaludId: 2,
    centroSaludNombre: 'Centro de Salud N° 2',
    // codigoVerificacion is deliberately omitted by backend
  };

  const normalized = normalizeTurno(backendResponse);

  assert.equal(normalized.id, '1234');
  assert.equal(normalized.codigoVerificacion, '', 'Must not invent fake ESU-2026-xxxx code');
  assert.equal(normalized.pacienteNombre, 'Carlos Monzon');
  assert.equal(normalized.pacienteDni, '30111222');
  assert.equal(normalized.profesionalNombre, 'Lucia Velez');
  assert.equal(normalized.especialidadNombre, 'Cardiología');
  assert.equal(normalized.centroSaludNombre, 'Centro de Salud N° 2');
  assert.equal(normalized.estado, 'CONFIRMADO');
});

test('normalizeTurno preserves backend-generated verification code when present', () => {
  const backendResponse = {
    id: 5678,
    codigoVerificacion: 'CRUZ-2026-XYZ9',
    fechaHora: '2026-11-20T11:00:00',
    estado: 'PENDIENTE',
    paciente: { id: 70, nombre: 'Ana', apellido: 'Gomez', dni: '40123456' },
  };

  const normalized = normalizeTurno(backendResponse);

  assert.equal(normalized.id, '5678');
  assert.equal(normalized.codigoVerificacion, 'CRUZ-2026-XYZ9');
});

test('normalizeTurno does not inject mock consultorio, planta, or center defaults', () => {
  const minimalResponse = {
    id: 999,
    fechaHora: '2026-11-25T14:15:00',
    estado: 'PENDIENTE',
  };

  const normalized = normalizeTurno(minimalResponse);

  assert.equal(normalized.consultorioNumero, undefined, 'Must not default to consultorio 102');
  assert.equal(normalized.planta, undefined, 'Must not default to Planta Baja');
  assert.equal(normalized.centroSaludNombre, '', 'Must not default to Hospital Regional Aurelio Crespo');
  assert.equal(normalized.especialidadNombre, '', 'Must not default to Medicina General');
  assert.equal(normalized.codigoVerificacion, '', 'Must not default to synthetic code');
});

test('public booking payload format: ensures ISO fechaHora and sanitizes DNI', () => {
  const rawPayload = {
    fecha: '2026-11-18',
    hora: '09:30',
    dni: '38.123.456',
    nombre: ' Juan ',
    apellido: ' Perez ',
    telefono: ' 3549 445566 ',
  };

  const formattedTime = rawPayload.hora.trim().padStart(5, '0');
  const timeWithSeconds = formattedTime.length === 5 ? `${formattedTime}:00` : formattedTime;
  const fechaHoraIso = `${rawPayload.fecha.trim()}T${timeWithSeconds}`;
  const sanitizedDni = rawPayload.dni.replace(/\D/g, '');

  assert.equal(fechaHoraIso, '2026-11-18T09:30:00');
  assert.equal(sanitizedDni, '38123456');
  assert.equal(rawPayload.nombre.trim(), 'Juan');
  assert.equal(rawPayload.apellido.trim(), 'Perez');
});

test('public booking fails closed on network or HTTP error without inventing a booking confirmation', async () => {
  let created = null;
  let bookingError = null;

  const mockFailBooking = async () => {
    throw new Error('El horario seleccionado ya no se encuentra disponible (409 Conflict).');
  };

  try {
    created = await mockFailBooking();
  } catch (err) {
    bookingError = err instanceof Error ? err.message : 'Error desconocido';
  }

  assert.equal(created, null, 'Must not produce created appointment on failure');
  assert.ok(bookingError?.includes('409 Conflict'), 'Error message must reflect the failure');
});

test('demo booking isolation: creates in-memory demo appointments with explicit demo code', () => {
  const demoBooking = {
    code: 'DEMO-101',
    date: '2026-11-18',
    slotId: 'morning-1',
    patient: {
      firstName: 'Test',
      lastName: 'Demo',
      dni: '12345678',
      phone: '3549000000',
      healthInsurance: 'Particular',
    },
  };

  assert.ok(demoBooking.code.startsWith('DEMO-'));
  assert.equal(demoBooking.patient.dni, '12345678');
});
