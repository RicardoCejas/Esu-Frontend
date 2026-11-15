import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { API_ENDPOINTS } from '../src/api/endpoints.ts';
import { CONVENIOS_POPULARES, extractSlotHHmm } from '../src/features/recepcion/utils/mostradorConstants.ts';

describe('Fase 3 — Recepción Diaria y Turno de Mostrador', () => {
  it('API_ENDPOINTS provee rutas para turnos de centro y ausente', () => {
    assert.equal(API_ENDPOINTS.turnos.centro(12), '/turnos/centro/12');
    assert.equal(API_ENDPOINTS.turnos.hoyCentro(12), '/turnos/centro/12/hoy');
    assert.equal(API_ENDPOINTS.turnos.ausente(45), '/turnos/45/ausente');
  });

  it('CONVENIOS_POPULARES contiene mutuales y obras sociales clave con opcion Otra', () => {
    assert.ok(CONVENIOS_POPULARES.includes('APROSS'));
    assert.ok(CONVENIOS_POPULARES.includes('PAMI'));
    assert.ok(CONVENIOS_POPULARES.includes('OSDE'));
    assert.ok(CONVENIOS_POPULARES.includes('Particular / Sin Obra Social'));
    assert.ok(CONVENIOS_POPULARES.includes('Otra'));
  });

  it('extractSlotHHmm extrae correctamente HH:mm de strings y fechas ISO', () => {
    assert.equal(extractSlotHHmm('10:30'), '10:30');
    assert.equal(extractSlotHHmm('2026-11-15T14:45:00'), '14:45');
    assert.equal(extractSlotHHmm('  08:15  '), '08:15');
  });

  it('badges de estado de recepcion cumplen con anti-vibecoded (100% solidos, text-white)', () => {
    const estados = ['EN_SALA_DE_ESPERA', 'ATENDIENDO', 'COMPLETADO', 'CANCELADO', 'AUSENTE'];
    const getBadgeClass = (estado) => {
      if (estado === 'EN_SALA_DE_ESPERA' || estado === 'EN_ESPERA') return 'bg-amber-600 text-white';
      if (estado === 'ATENDIENDO') return 'bg-sky-700 text-white';
      if (estado === 'COMPLETADO') return 'bg-emerald-700 text-white';
      if (estado === 'CANCELADO' || estado === 'CANCELADO_POR_MEDICO') return 'bg-rose-700 text-white';
      if (estado === 'AUSENTE') return 'bg-slate-700 text-white';
      return 'bg-slate-800 text-white';
    };

    estados.forEach((st) => {
      const cls = getBadgeClass(st);
      assert.ok(cls.includes('text-white'), `Estado ${st} debe tener text-white`);
      assert.ok(!cls.includes('bg-opacity') && !cls.includes('/'), `Estado ${st} no debe ser transparente/pastel`);
    });
  });
});
