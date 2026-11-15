import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ESTUDIOS_DIAGNOSTICOS_CATALOGO,
  buildFloorOptions,
  buildGoogleMapsUrl,
  parseCoordinatePair,
} from '../src/lib/centroUtils.ts';
import {
  INITIAL_SEDE_VALUES,
  toSedeFormValues,
  validateAllSedeFields,
  validateSedeField,
} from '../src/features/recepcion/utils/sedeFormHelpers.ts';
import { mapCentroSaludToPin } from '../src/features/home/mapaCentrosData.ts';

describe('Centro Médico Phase 1 — Sede Floors, Maps, Studies & Consultorios', () => {
  it('buildFloorOptions generates progressive floors clamped between 1 and 30 and preserves legacy floors', () => {
    assert.deepEqual(buildFloorOptions(1), ['Planta Baja']);
    assert.deepEqual(buildFloorOptions(3), ['Planta Baja', '1° Piso', '2° Piso']);
    assert.deepEqual(buildFloorOptions(2, 'Subsuelo'), ['Planta Baja', '1° Piso', 'Subsuelo']);
    assert.deepEqual(buildFloorOptions(2, 'planta baja'), ['Planta Baja', '1° Piso']);
    assert.equal(buildFloorOptions(99).length, 30);
    assert.deepEqual(buildFloorOptions(0), ['Planta Baja']);
  });

  it('parseCoordinatePair validates geographic ranges and normalizes to 6 decimals', () => {
    assert.deepEqual(parseCoordinatePair(-30.7281234, -64.8019876), {
      lat: -30.728123,
      lng: -64.801988,
    });
    assert.equal(parseCoordinatePair(-91, -64.8), null);
    assert.equal(parseCoordinatePair(-30.7, 181), null);
    assert.equal(parseCoordinatePair('', -64.8), null);
    assert.equal(parseCoordinatePair('abc', -64.8), null);
  });

  it('buildGoogleMapsUrl builds coordinate query when valid and fallback address query otherwise', () => {
    assert.equal(
      buildGoogleMapsUrl(-30.7285, -64.8012, 'Hospital'),
      'https://www.google.com/maps/search/?api=1&query=-30.7285,-64.8012'
    );
    assert.equal(
      buildGoogleMapsUrl(undefined, undefined, 'Av. Sarmiento 500'),
      'https://www.google.com/maps/search/?api=1&query=Av.%20Sarmiento%20500'
    );
  });

  it('sedeFormHelpers validates floors (1..30), coordinates and diagnostic studies cleanly', () => {
    assert.ok(validateSedeField('cantidadPlantas', '0'));
    assert.ok(validateSedeField('cantidadPlantas', '31'));
    assert.equal(validateSedeField('cantidadPlantas', '4'), undefined);
    assert.ok(validateSedeField('latitud', '-95'));
    assert.equal(validateSedeField('latitud', '-30.728'), undefined);

    const invalidEstudios = {
      ...INITIAL_SEDE_VALUES,
      nombre: 'Hospital Regional',
      direccion: 'Av. Sarmiento 123',
      ciudad: 'Cruz del Eje',
      telefono: '3549422000',
      horarioAtencion: '24 hs',
      cantidadPlantas: '3',
      permiteEstudios: true,
      estudiosDisponibles: [],
    };
    const errors = validateAllSedeFields(invalidEstudios);
    assert.ok(errors.estudiosDisponibles);

    const mapped = toSedeFormValues({
      id: '1',
      nombre: 'Hospital Crespo',
      tipo: 'HOSPITAL',
      direccion: 'Sarmiento 100',
      telefono: '3549111222',
      horarioAtencion: '24 hs',
      cantidadPlantas: 4,
      permiteEstudios: true,
      estudiosDisponibles: [ESTUDIOS_DIAGNOSTICOS_CATALOGO[0]],
      latitud: -30.7281,
      longitud: -64.8015,
    });
    assert.equal(mapped.cantidadPlantas, '4');
    assert.equal(mapped.latitud, '-30.7281');
    assert.deepEqual(mapped.estudiosDisponibles, [ESTUDIOS_DIAGNOSTICOS_CATALOGO[0]]);
  });

  it('mapCentroSaludToPin maps backend coordinates, badge colors and fallback photo cleanly', () => {
    const pin = mapCentroSaludToPin({
      id: '99',
      nombre: 'Centro Médico Nuevo',
      tipo: 'CLINICA',
      direccion: 'Belgrano 450',
      ciudad: 'Cruz del Eje',
      telefono: '3549444555',
      horarioAtencion: '08:00 - 20:00',
      disponibleGuardia: true,
      permiteConsultas: true,
      permiteEstudios: true,
      estudiosDisponibles: ['Radiografía Digital'],
      latitud: -30.731,
      longitud: -64.804,
    });

    assert.equal(pin.backendId, '99');
    assert.equal(pin.lat, -30.731);
    assert.equal(pin.lng, -64.804);
    assert.equal(pin.esGuardia, true);
    assert.equal(pin.badgeColor, 'bg-sky-700 text-white');
    assert.ok(pin.especialidades.includes('Radiografía Digital'));
    assert.ok(pin.googleMapsUrl.includes('-30.731,-64.804'));
  });

  it('Exposes consultorio edit route under RECEPCIONISTA and clean UI invariants across Phase 1 files', () => {
    const root = path.resolve(import.meta.dirname, '..');
    const routesSource = fs.readFileSync(path.join(root, 'src/routes/AppRoutes.tsx'), 'utf8');
    const recepOnlyBlock =
      routesSource.match(/allowedRoles=\{\['RECEPCIONISTA'\]\}[\s\S]*?Módulo Administrador/)?.[0] ?? '';
    assert.ok(
      recepOnlyBlock.includes('path="recepcion/sede/consultorios/:id/editar"'),
      'Missing dedicated consultorio edit route inside RECEPCIONISTA guard'
    );

    const centrosServiceSource = fs.readFileSync(path.join(root, 'src/api/centrosService.ts'), 'utf8');
    for (const methodName of ['getConsultorioById', 'updateConsultorio', 'cambiarEstadoConsultorio', 'updateCentro']) {
      assert.ok(centrosServiceSource.includes(methodName), `Missing ${methodName} in centrosService.ts`);
    }

    const phase1UiFiles = [
      'src/components/maps/CenterMapPicker.tsx',
      'src/features/recepcion/EditarSedePage.tsx',
      'src/features/recepcion/components/SedeUbicacionSection.tsx',
      'src/features/recepcion/components/SedeServiciosSection.tsx',
      'src/features/recepcion/components/SedeInfoCard.tsx',
      'src/features/recepcion/components/ConsultoriosCentroTab.tsx',
      'src/features/recepcion/components/ConsultorioFormFields.tsx',
      'src/features/recepcion/components/ConsultorioFloorSelector.tsx',
      'src/features/recepcion/EditarConsultorioPage.tsx',
      'src/features/recepcion/NuevoConsultorioPage.tsx',
      'src/features/admin/AdminMapaPinesPage.tsx',
      'src/features/home/MapaCruzDelEje.tsx',
      'src/features/home/components/MapaCentroDetailCard.tsx',
      'src/features/home/components/MapaCentroPills.tsx',
    ];

    const forbidden = [/\bSparkles\b/, /border-l-/, /\bwindow\.confirm\b/, /\bwindow\.alert\b/, /Ã[¡©­³ºñÑ]|\uFFFD/];
    for (const rel of phase1UiFiles) {
      const buf = fs.readFileSync(path.join(root, rel));
      assert.equal(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, false, `${rel} must not contain UTF-8 BOM`);
      const text = buf.toString('utf8');
      for (const pattern of forbidden) {
        assert.equal(pattern.test(text), false, `${rel} matched forbidden UI/encoding pattern: ${pattern}`);
      }
    }
  });
});
