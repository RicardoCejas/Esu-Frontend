import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Fase 7 — Médicos, Agendas/Bloqueos y Especialidades de la Sede', () => {
  it('debe aplicar badges sólidos de alto contraste según anti-vibecoded para el estado médico', () => {
    function getEstadoBadge(activo) {
      const isActivo = activo !== false;
      return {
        className: isActivo ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-700 text-white font-bold',
        label: isActivo ? 'Activo' : 'Inactivo',
      };
    }

    const activo = getEstadoBadge(true);
    assert.equal(activo.label, 'Activo');
    assert.ok(activo.className.includes('bg-emerald-700'));
    assert.ok(activo.className.includes('text-white'));

    const inactivo = getEstadoBadge(false);
    assert.equal(inactivo.label, 'Inactivo');
    assert.ok(inactivo.className.includes('bg-slate-700'));
    assert.ok(inactivo.className.includes('text-white'));
  });

  it('debe validar contraseña de al menos 8 caracteres en alta de profesional médico', () => {
    function validatePassword(pass) {
      if (!pass || pass.trim().length < 8) {
        return 'La contraseña de acceso debe contener al menos 8 caracteres.';
      }
      return null;
    }

    assert.equal(validatePassword(''), 'La contraseña de acceso debe contener al menos 8 caracteres.');
    assert.equal(validatePassword('12345'), 'La contraseña de acceso debe contener al menos 8 caracteres.');
    assert.equal(validatePassword('short7'), 'La contraseña de acceso debe contener al menos 8 caracteres.');
    assert.equal(validatePassword('segura123'), null);
    assert.equal(validatePassword('Doctor2026!'), null);
  });

  it('debe construir el payload estructurado de disponibilidad con consultorio habitual e intervalo en minutos', () => {
    function buildDisponibilidadPayload(req) {
      return {
        profesionalId: Number(req.profesionalId),
        centroSaludId: Number(req.centroSaludId),
        consultorioId: req.consultorioId ? Number(req.consultorioId) : null,
        diaSemana: req.diaSemana.toUpperCase(),
        horaInicio: req.horaInicio.length === 5 ? `${req.horaInicio}:00` : req.horaInicio,
        horaFin: req.horaFin.length === 5 ? `${req.horaFin}:00` : req.horaFin,
        intervaloMinutos: Number(req.intervaloMinutos),
        duracionMinutos: Number(req.intervaloMinutos),
        activo: true,
      };
    }

    const payload = buildDisponibilidadPayload({
      profesionalId: '10',
      centroSaludId: '1',
      consultorioId: '5',
      diaSemana: 'Lunes',
      horaInicio: '08:30',
      horaFin: '13:30',
      intervaloMinutos: 20,
    });

    assert.equal(payload.profesionalId, 10);
    assert.equal(payload.centroSaludId, 1);
    assert.equal(payload.consultorioId, 5);
    assert.equal(payload.diaSemana, 'LUNES');
    assert.equal(payload.horaInicio, '08:30:00');
    assert.equal(payload.horaFin, '13:30:00');
    assert.equal(payload.intervaloMinutos, 20);
    assert.equal(payload.activo, true);
  });

  it('debe filtrar correctamente las especialidades habilitadas en la sede según los médicos adscriptos', () => {
    const catalogo = [
      { id: '1', nombre: 'Cardiología' },
      { id: '2', nombre: 'Pediatría' },
      { id: '3', nombre: 'Dermatología' },
      { id: '4', nombre: 'Traumatología' },
    ];

    const medicosSede = [
      { id: '101', nombre: 'Juan', apellido: 'Pérez', especialidadId: '1' },
      { id: '102', nombre: 'Laura', apellido: 'Gómez', especialidadId: '2' },
      { id: '103', nombre: 'Carlos', apellido: 'Bustos', especialidadId: '1' },
    ];

    const especialidadesConMedicosIds = new Set(medicosSede.map((m) => m.especialidadId));

    const habilitadas = catalogo.filter((e) => especialidadesConMedicosIds.has(e.id));
    assert.equal(habilitadas.length, 2);
    assert.deepEqual(habilitadas.map((e) => e.nombre), ['Cardiología', 'Pediatría']);

    // Traumatología y Dermatología no tienen médicos adscriptos en la sede
    assert.equal(especialidadesConMedicosIds.has('3'), false);
    assert.equal(especialidadesConMedicosIds.has('4'), false);
  });

  it('debe restringir la vinculación y desvinculación a la sede activa del recepcionista', () => {
    const activeCentroId = '1';
    const medico = {
      id: '20',
      nombre: 'Martín',
      apellido: 'Cejas',
      centrosSaludIds: ['1', '2'],
    };

    function puedeDesvincularDeSede(centroTargetId, currentCentroId, userRol) {
      if (userRol === 'ADMIN') return true;
      return String(centroTargetId) === String(currentCentroId);
    }

    assert.equal(puedeDesvincularDeSede('1', activeCentroId, 'RECEPCIONISTA'), true);
    assert.equal(puedeDesvincularDeSede('2', activeCentroId, 'RECEPCIONISTA'), false);
    assert.equal(puedeDesvincularDeSede('2', activeCentroId, 'ADMIN'), true);
  });
});
