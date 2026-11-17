import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarCupoSobreturno,
  validarDatosSobreturno,
  LIMITE_SOBRETURNOS_DIARIOS,
  MOTIVOS_SOBRETURNO,
} from '../src/lib/sobreturnoRules.ts';
import { CONVENIOS_POPULARES, extractSlotHHmm } from '../src/features/recepcion/utils/mostradorConstants.ts';

describe('Fase 4 - Salas de Espera Kanban, Sobreturnos y Cartelera TV', () => {
  it('debe respetar el límite de 3 sobreturnos diarios por médico', () => {
    assert.equal(LIMITE_SOBRETURNOS_DIARIOS, 3);

    const conCero = validarCupoSobreturno(0);
    assert.equal(conCero.cupoAlcanzado, false);
    assert.equal(conCero.cuposRestantes, 3);

    const conDos = validarCupoSobreturno(2);
    assert.equal(conDos.cupoAlcanzado, false);
    assert.equal(conDos.cuposRestantes, 1);

    const conTres = validarCupoSobreturno(3);
    assert.equal(conTres.cupoAlcanzado, true);
    assert.equal(conTres.cuposRestantes, 0);

    const conCuatro = validarCupoSobreturno(4);
    assert.equal(conCuatro.cupoAlcanzado, true);
    assert.equal(conCuatro.cuposRestantes, 0);
  });

  it('debe validar datos requeridos para registrar un sobreturno', () => {
    const sinProf = validarDatosSobreturno({
      profesionalId: '',
      centroSaludId: '1',
      sobreturnosHoyCount: 0,
      nombre: 'Juan',
      apellido: 'Perez',
      dni: '12345678',
      motivo: MOTIVOS_SOBRETURNO[0],
    });
    assert.equal(sinProf.valido, false);
    assert.match(sinProf.error, /profesional/i);

    const cupoLleno = validarDatosSobreturno({
      profesionalId: '10',
      centroSaludId: '1',
      sobreturnosHoyCount: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      dni: '12345678',
      motivo: MOTIVOS_SOBRETURNO[0],
    });
    assert.equal(cupoLleno.valido, false);
    assert.match(cupoLleno.error, /cupo/i);

    const valido = validarDatosSobreturno({
      profesionalId: '10',
      centroSaludId: '1',
      sobreturnosHoyCount: 1,
      nombre: 'María',
      apellido: 'Gómez',
      dni: '30111222',
      motivo: 'Demanda Espontánea en Sala',
      observacion: 'Urgencia odontológica leve',
    });
    assert.equal(valido.valido, true);
    assert.match(valido.motivoCompleto, /Demanda Espontánea en Sala \(Urgencia odontológica leve\)/);
  });

  it('debe proveer convenios populares y extracción horaria para el mostrador', () => {
    assert.ok(CONVENIOS_POPULARES.includes('APROSS'));
    assert.ok(CONVENIOS_POPULARES.includes('PAMI'));
    assert.ok(CONVENIOS_POPULARES.includes('Particular / Sin Obra Social'));
    assert.ok(CONVENIOS_POPULARES.includes('Otra'));

    assert.equal(extractSlotHHmm('2026-11-11T09:30:00'), '09:30');
    assert.equal(extractSlotHHmm('14:15'), '14:15');
  });

  it('debe estructurar el payload de sobreturno con consultorioNumero y planta', () => {
    const payload = {
      profesionalId: '12',
      pacienteNombre: 'Carlos Tevez',
      pacienteDni: '28111222',
      obraSocial: 'APROSS',
      centroSaludId: '1',
      fecha: '2026-11-11',
      hora: '10:30',
      consultorioNumero: '4',
      planta: 'Planta Baja',
      motivoSobreturno: 'Urgencia',
    };

    assert.equal(payload.consultorioNumero, '4');
    assert.equal(payload.planta, 'Planta Baja');
  });
});
