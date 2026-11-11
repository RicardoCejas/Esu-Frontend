import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarMotivoCancelacion,
  MOTIVOS_CANCELACION_MOSTRADOR,
} from '../src/lib/cancelacionTurno.ts';

describe('HU-INT-04: Lógica de Cancelación Estructurada y Trazabilidad de Mostrador', () => {
  describe('MOTIVOS_CANCELACION_MOSTRADOR', () => {
    it('debe contener los 6 motivos oficiales tipificados con ID y descripción', () => {
      assert.equal(MOTIVOS_CANCELACION_MOSTRADOR.length, 6);
      const ids = MOTIVOS_CANCELACION_MOSTRADOR.map((m) => m.id);
      assert.ok(ids.includes('DESISTIMIENTO_PACIENTE'));
      assert.ok(ids.includes('IMPREVISTO_PACIENTE'));
      assert.ok(ids.includes('DEMORA_EXCESIVA'));
      assert.ok(ids.includes('ERROR_CARGA'));
      assert.ok(ids.includes('AUSENCIA_MEDICA'));
      assert.ok(ids.includes('REAGENDADO_MOSTRADOR'));
    });
  });

  describe('validarMotivoCancelacion', () => {
    it('debe rechazar motivos vacíos o con solo espacios en blanco (fail-closed)', () => {
      const resVacio = validarMotivoCancelacion('');
      assert.equal(resVacio.valido, false);
      assert.ok(resVacio.error?.includes('obligatorio'));

      const resEspacios = validarMotivoCancelacion('   ');
      assert.equal(resEspacios.valido, false);
    });

    it('debe generar el motivo final simple cuando no hay observaciones', () => {
      const res = validarMotivoCancelacion('Desistimiento voluntario del paciente', '');
      assert.equal(res.valido, true);
      assert.equal(res.motivoFinal, 'Desistimiento voluntario del paciente');

      const resUndefined = validarMotivoCancelacion('Desistimiento voluntario del paciente', undefined);
      assert.equal(resUndefined.valido, true);
      assert.equal(resUndefined.motivoFinal, 'Desistimiento voluntario del paciente');
    });

    it('debe formatear motivo estructurado con detalle cuando hay observación', () => {
      const res = validarMotivoCancelacion(
        'Imprevisto o fuerza mayor del paciente',
        'Corte de ruta por temporal en Cruz del Eje'
      );
      assert.equal(res.valido, true);
      assert.equal(
        res.motivoFinal,
        'Imprevisto o fuerza mayor del paciente - Detalle: Corte de ruta por temporal en Cruz del Eje'
      );
    });

    it('debe rechazar observaciones que superen los 255 caracteres', () => {
      const observacionLarga = 'a'.repeat(256);
      const res = validarMotivoCancelacion('Desistimiento voluntario del paciente', observacionLarga);
      assert.equal(res.valido, false);
      assert.ok(res.error?.includes('255'));
    });

    it('debe aceptar observaciones exactamente en el límite de 255 caracteres', () => {
      const observacionLimite = 'x'.repeat(255);
      const res = validarMotivoCancelacion('Desistimiento voluntario del paciente', observacionLimite);
      assert.equal(res.valido, true);
      assert.ok(res.motivoFinal.includes(observacionLimite));
    });
  });
});
