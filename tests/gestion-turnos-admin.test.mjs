import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('HU-INT-01: GestionTurnosAdmin Logic & Scoping', () => {
  const mockTurnos = [
    {
      id: '101',
      pacienteNombre: 'Juan Perez',
      profesionalNombre: 'Dr. Gomez',
      centroSaludId: 1,
      centroSaludNombre: 'Hospital Crespo',
      fecha: '2026-11-09',
      hora: '09:00',
      estado: 'CONFIRMADO',
      codigoVerificacion: 'COD-101',
    },
    {
      id: '102',
      pacienteNombre: 'Maria Garcia',
      profesionalNombre: 'Dra. Lopez',
      centroSaludId: 2,
      centroSaludNombre: 'Clinica Cabrera',
      fecha: '2026-11-09',
      hora: '10:00',
      estado: 'EN_ESPERA',
      codigoVerificacion: 'COD-102',
    },
    {
      id: '103',
      pacienteNombre: 'Carlos Tevez',
      profesionalNombre: 'Dr. Gomez',
      centroSaludId: 1,
      centroSaludNombre: 'Hospital Crespo',
      fecha: '2026-11-10',
      hora: '11:00',
      estado: 'CANCELADO',
      codigoVerificacion: 'COD-103',
    },
  ];

  function filterTurnos(turnos, { busqueda = '', filtroEstado = 'TODOS', fechaDesde = '', fechaHasta = '', esRecepcionista = false, centroSaludId = null }) {
    const term = busqueda.trim().toLowerCase();

    return turnos.filter((t) => {
      if (esRecepcionista && centroSaludId && t.centroSaludId && String(t.centroSaludId) !== String(centroSaludId)) {
        return false;
      }

      const matchTexto =
        !term ||
        (t.pacienteNombre ?? '').toLowerCase().includes(term) ||
        (t.profesionalNombre ?? '').toLowerCase().includes(term) ||
        (t.centroSaludNombre ?? '').toLowerCase().includes(term) ||
        (t.codigoVerificacion ? t.codigoVerificacion.toLowerCase().includes(term) : false) ||
        (t.id ?? '').includes(term);

      const matchEstado = filtroEstado === 'TODOS' || t.estado === filtroEstado;
      const matchFechaDesde = !fechaDesde || (t.fecha ?? '') >= fechaDesde;
      const matchFechaHasta = !fechaHasta || (t.fecha ?? '') <= fechaHasta;

      return matchTexto && matchEstado && matchFechaDesde && matchFechaHasta;
    });
  }

  it('debe filtrar turnos por texto en paciente, médico o código', () => {
    const resultPaciente = filterTurnos(mockTurnos, { busqueda: 'Maria' });
    assert.equal(resultPaciente.length, 1);
    assert.equal(resultPaciente[0].id, '102');

    const resultMedico = filterTurnos(mockTurnos, { busqueda: 'Dr. Gomez' });
    assert.equal(resultMedico.length, 2);

    const resultCodigo = filterTurnos(mockTurnos, { busqueda: 'COD-103' });
    assert.equal(resultCodigo.length, 1);
    assert.equal(resultCodigo[0].id, '103');
  });

  it('debe aislar turnos por centro de salud para recepcionistas', () => {
    const resultRecepcionista = filterTurnos(mockTurnos, {
      esRecepcionista: true,
      centroSaludId: 1,
    });

    assert.equal(resultRecepcionista.length, 2);
    assert.ok(resultRecepcionista.every((t) => String(t.centroSaludId) === '1'));
    assert.ok(!resultRecepcionista.some((t) => String(t.centroSaludId) === '2'));
  });

  it('debe filtrar correctamente por rango de fechas y estado', () => {
    const resultFecha = filterTurnos(mockTurnos, {
      fechaDesde: '2026-11-10',
      fechaHasta: '2026-11-10',
    });
    assert.equal(resultFecha.length, 1);
    assert.equal(resultFecha[0].id, '103');

    const resultEstado = filterTurnos(mockTurnos, {
      filtroEstado: 'EN_ESPERA',
    });
    assert.equal(resultEstado.length, 1);
    assert.equal(resultEstado[0].id, '102');
  });
});
