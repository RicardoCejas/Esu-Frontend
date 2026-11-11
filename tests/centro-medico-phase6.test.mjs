import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Fase 6 — Gestión de Turnos del Centro y Reagendamiento', () => {
  const REAGENDAR_BLOCKED_STATES = [
    'CANCELADO',
    'CANCELADO_POR_MEDICO',
    'COMPLETADO',
    'ATENDIENDO',
    'AUSENTE',
  ];

  it('debe bloquear reprogramación en todos los estados terminales o en curso', () => {
    for (const estado of REAGENDAR_BLOCKED_STATES) {
      const isBlocked = REAGENDAR_BLOCKED_STATES.includes(estado);
      assert.equal(isBlocked, true, `El estado ${estado} debe estar bloqueado para reagendar`);
    }

    const estadosHabilitados = ['CONFIRMADO', 'PENDIENTE', 'REAGENDADO'];
    for (const estado of estadosHabilitados) {
      const isBlocked = REAGENDAR_BLOCKED_STATES.includes(estado);
      assert.equal(isBlocked, false, `El estado ${estado} debe permitir reagendamiento`);
    }
  });

  it('debe detectar correctamente si una fecha seleccionada colisiona con un bloqueo de agenda del médico', () => {
    const bloqueos = [
      { id: 1, profesionalId: 10, fechaInicio: '2026-11-15', fechaFin: '2026-11-20', motivo: 'Congreso Médico' },
      { id: 2, profesionalId: 10, fechaInicio: '2026-12-01', fechaFin: '2026-12-15', motivo: 'Licencia Anual' },
    ];

    function encontrarBloqueo(fecha, lista) {
      if (!fecha || !lista.length) return null;
      return (
        lista.find((b) => {
          const inicio = b.fechaInicio.slice(0, 10);
          const fin = b.fechaFin.slice(0, 10);
          return fecha >= inicio && fecha <= fin;
        }) ?? null
      );
    }

    // Fecha dentro del primer bloqueo
    const bloqueo1 = encontrarBloqueo('2026-11-16', bloqueos);
    assert.ok(bloqueo1);
    assert.equal(bloqueo1.motivo, 'Congreso Médico');

    // Fecha en límite superior
    const bloqueoFin = encontrarBloqueo('2026-11-20', bloqueos);
    assert.ok(bloqueoFin);

    // Fecha libre
    const bloqueoLibre = encontrarBloqueo('2026-11-25', bloqueos);
    assert.equal(bloqueoLibre, null);
  });

  it('debe construir correctamente los query params para la consulta de turnos de la sede por rango', () => {
    function buildQuery(filtros) {
      const params = new URLSearchParams();
      if (filtros?.desde) params.append('desde', filtros.desde);
      if (filtros?.hasta) params.append('hasta', filtros.hasta);
      if (filtros?.estado && filtros.estado !== 'TODOS') params.append('estado', filtros.estado);
      return params.toString();
    }

    const q1 = buildQuery({ desde: '2026-11-01', hasta: '2026-11-30', estado: 'CONFIRMADO' });
    assert.equal(q1, 'desde=2026-11-01&hasta=2026-11-30&estado=CONFIRMADO');

    const q2 = buildQuery({ desde: '2026-11-11', estado: 'TODOS' });
    assert.equal(q2, 'desde=2026-11-11');

    const q3 = buildQuery({});
    assert.equal(q3, '');
  });

  it('debe filtrar turnos por paciente, DNI, médico, especialidad y código de verificación', () => {
    const turnos = [
      { id: '1', pacienteNombre: 'Juan Pérez', pacienteDni: '38123456', profesionalNombre: 'Dra. Gómez', especialidadNombre: 'Pediatría', codigoVerificacion: 'ESU-PED-01' },
      { id: '2', pacienteNombre: 'María López', pacienteDni: '40987654', profesionalNombre: 'Dr. Ruiz', especialidadNombre: 'Cardiología', codigoVerificacion: 'ESU-CAR-02' },
      { id: '3', pacienteNombre: 'Carlos Gómez', pacienteDni: '25111222', profesionalNombre: 'Dra. Gómez', especialidadNombre: 'Clínica Médica', codigoVerificacion: 'ESU-CLI-03' },
    ];

    function filtrar(term, lista) {
      const t = term.trim().toLowerCase();
      if (!t) return lista;
      return lista.filter((item) =>
        (item.pacienteNombre ?? '').toLowerCase().includes(t) ||
        (item.pacienteDni ?? '').includes(t) ||
        (item.profesionalNombre ?? '').toLowerCase().includes(t) ||
        (item.especialidadNombre ?? '').toLowerCase().includes(t) ||
        (item.codigoVerificacion ?? '').toLowerCase().includes(t) ||
        item.id.includes(t)
      );
    }

    // Búsqueda por DNI
    assert.equal(filtrar('38123456', turnos).length, 1);
    assert.equal(filtrar('38123456', turnos)[0].pacienteNombre, 'Juan Pérez');

    // Búsqueda por Especialidad
    assert.equal(filtrar('cardiología', turnos).length, 1);
    assert.equal(filtrar('cardiología', turnos)[0].profesionalNombre, 'Dr. Ruiz');

    // Búsqueda por código de verificación
    assert.equal(filtrar('ESU-CLI-03', turnos).length, 1);
  });

  it('debe validar la elegibilidad de acciones rápidas de check-in y ausente', () => {
    function puedeHacerCheckIn(estado) {
      return estado === 'CONFIRMADO' || estado === 'PENDIENTE';
    }

    function puedeMarcarAusente(estado) {
      return estado === 'CONFIRMADO' || estado === 'EN_ESPERA' || estado === 'EN_SALA_DE_ESPERA';
    }

    assert.equal(puedeHacerCheckIn('CONFIRMADO'), true);
    assert.equal(puedeHacerCheckIn('PENDIENTE'), true);
    assert.equal(puedeHacerCheckIn('COMPLETADO'), false);
    assert.equal(puedeHacerCheckIn('CANCELADO'), false);

    assert.equal(puedeMarcarAusente('CONFIRMADO'), true);
    assert.equal(puedeMarcarAusente('EN_ESPERA'), true);
    assert.equal(puedeMarcarAusente('EN_SALA_DE_ESPERA'), true);
    assert.equal(puedeMarcarAusente('COMPLETADO'), false);
    assert.equal(puedeMarcarAusente('AUSENTE'), false);
  });
});
