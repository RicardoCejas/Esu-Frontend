import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_HOME_SPECIALTIES,
  selectFeaturedSpecialties,
  getSpecialtyImage,
} from '../src/features/home/especialidadesHelpers.ts';

test('selectFeaturedSpecialties limits long backend specialty catalog to 6 items', () => {
  const catalog = [
    { id: '1', nombre: 'Clínica Médica / Medicina General', descripcion: 'Atención primaria' },
    { id: '2', nombre: 'Pediatría y Neonatología', descripcion: 'Niños' },
    { id: '3', nombre: 'Cardiología Clínica', descripcion: 'Corazón' },
    { id: '4', nombre: 'Traumatología y Ortopedia', descripcion: 'Huesos' },
    { id: '5', nombre: 'Ginecología y Obstetricia', descripcion: 'Salud femenina' },
    { id: '6', nombre: 'Oftalmología', descripcion: 'Visión' },
    { id: '7', nombre: 'Odontología Integral', descripcion: 'Dental' },
    { id: '8', nombre: 'Dermatología', descripcion: 'Piel' },
    { id: '9', nombre: 'Neurología', descripcion: 'Sistema nervioso' },
  ];

  const featured = selectFeaturedSpecialties(catalog);

  assert.equal(featured.length, MAX_HOME_SPECIALTIES);
  assert.deepEqual(
    featured.map((item) => item.id),
    ['1', '2', '3', '4', '5', '6']
  );
});

test('selectFeaturedSpecialties prioritizes the 6 core specialties even when backend returns them out of order', () => {
  const catalog = [
    { id: '20', nombre: 'Psiquiatría', descripcion: 'Salud mental' },
    { id: '2', nombre: 'Pediatría', descripcion: 'Niños' },
    { id: '21', nombre: 'Urología', descripcion: 'Urología' },
    { id: '1', nombre: 'Clínica Médica', descripcion: 'Clínica' },
    { id: '6', nombre: 'Oftalmología', descripcion: 'Ojos' },
    { id: '5', nombre: 'Ginecología y Obstetricia', descripcion: 'Gineco' },
    { id: '4', nombre: 'Traumatología', descripcion: 'Trauma' },
    { id: '3', nombre: 'Cardiología', descripcion: 'Cardio' },
  ];

  const featured = selectFeaturedSpecialties(catalog);

  assert.equal(featured.length, 6);
  assert.deepEqual(
    featured.map((item) => item.nombre),
    [
      'Clínica Médica',
      'Pediatría',
      'Cardiología',
      'Traumatología',
      'Ginecología y Obstetricia',
      'Oftalmología',
    ]
  );
});

test('getSpecialtyImage resolves the 6 core specialties to dedicated photo assets', () => {
  assert.equal(getSpecialtyImage('Clínica Médica / Medicina General'), '/especialidades/clinica-medica.jpg');
  assert.equal(getSpecialtyImage('Pediatría y Neonatología'), '/especialidades/pediatria.jpg');
  assert.equal(getSpecialtyImage('Cardiología Clínica'), '/especialidades/cardiologia.jpg');
  assert.equal(getSpecialtyImage('Traumatología y Ortopedia'), '/especialidades/traumatologia.jpg');
  assert.equal(getSpecialtyImage('Ginecología y Obstetricia'), '/especialidades/ginecologia.jpg');
  assert.equal(getSpecialtyImage('Oftalmología'), '/especialidades/oftalmologia.jpg');
});
