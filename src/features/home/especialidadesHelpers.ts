import type { Especialidad } from '@/types';

export const MAX_HOME_SPECIALTIES = 6;

export const normalizeSpecialtyText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const FEATURED_SPECIALTY_MATCHERS: Array<(normalizedName: string) => boolean> = [
  (n) => (n.includes('clinica') || n.includes('medicina general')) && !n.includes('cardio'),
  (n) => n.includes('pediatr'),
  (n) => n.includes('cardio'),
  (n) => n.includes('traumato') || n.includes('ortop'),
  (n) => n.includes('gineco') || n.includes('obstetr'),
  (n) => n.includes('oftalmo'),
];

export const selectFeaturedSpecialties = (
  especialidades: Especialidad[],
  limit = MAX_HOME_SPECIALTIES
): Especialidad[] => {
  if (!Array.isArray(especialidades) || especialidades.length === 0 || limit <= 0) {
    return [];
  }

  const selected: Especialidad[] = [];
  const usedIds = new Set<string>();

  for (const matches of FEATURED_SPECIALTY_MATCHERS) {
    if (selected.length >= limit) break;
    const match = especialidades.find(
      (esp) => !usedIds.has(esp.id) && matches(normalizeSpecialtyText(esp.nombre || ''))
    );
    if (match) {
      selected.push(match);
      usedIds.add(match.id);
    }
  }

  for (const esp of especialidades) {
    if (selected.length >= limit) break;
    if (!usedIds.has(esp.id)) {
      selected.push(esp);
      usedIds.add(esp.id);
    }
  }

  return selected.slice(0, limit);
};

export const getSpecialtyImage = (nombre: string): string => {
  const n = normalizeSpecialtyText(nombre);

  if (n.includes('pediatr') || n.includes('neonat')) return '/especialidades/pediatria.jpg';
  if (n.includes('cardio')) return '/especialidades/cardiologia.jpg';
  if (n.includes('traumato') || n.includes('ortop')) return '/especialidades/traumatologia.jpg';
  if (n.includes('gineco') || n.includes('obstetr')) return '/especialidades/ginecologia.jpg';
  if (n.includes('oftalmo')) return '/especialidades/oftalmologia.jpg';
  if (n.includes('clinica') || n.includes('medicina general')) return '/especialidades/clinica-medica.jpg';
  if (n.includes('derma')) return '/especialidades/dermatologia.jpg';
  if (n.includes('odonto')) return '/especialidades/odontologia.jpg';
  if (n.includes('neuro')) return '/especialidades/neurologia.jpg';
  if (n.includes('uro')) return '/especialidades/urologia.jpg';
  if (n.includes('cirug')) return '/especialidades/cirugia.jpg';
  if (n.includes('psicolo')) return '/especialidades/psicologia.jpg';
  if (n.includes('psiqui')) return '/especialidades/psiquiatria.jpg';
  if (n.includes('nutri')) return '/especialidades/nutricion.jpg';
  if (n.includes('kinesio') || n.includes('fisioter') || n.includes('fisiatr')) return '/especialidades/kinesiologia.jpg';
  if (n.includes('endocrin') || n.includes('diabet')) return '/especialidades/endocrinologia.jpg';
  if (n.includes('gastro')) return '/especialidades/gastroenterologia.jpg';
  if (n.includes('alerg')) return '/especialidades/alergia.jpg';
  if (n.includes('nefro')) return '/especialidades/nefrologia.jpg';
  if (n.includes('neumon')) return '/especialidades/neumonologia.jpg';
  if (n.includes('oncol')) return '/especialidades/oncologia.jpg';
  if (n.includes('otorrino') || n.includes('orl') || n.includes('fono')) return '/especialidades/otorrino.jpg';
  if (n.includes('reumat')) return '/especialidades/reumatologia.jpg';

  return '/especialidades/clinica-medica.jpg';
};

export const getFallbackSpecialtyDescription = (nombre: string): string => {
  const n = normalizeSpecialtyText(nombre);
  if (n.includes('pediatr')) return 'Atención integral del recién nacido, lactante, niños y adolescentes.';
  if (n.includes('cardio')) return 'Prevención cardiovascular, electrocardiogramas, Holter y control de presión arterial.';
  if (n.includes('traumato') || n.includes('ortop')) return 'Patologías óseas, articulares, fracturas, columna y traumatología deportiva.';
  if (n.includes('gineco') || n.includes('obstetr')) return 'Salud reproductiva, control prenatal, PAP, colposcopia y chequeos ginecológicos.';
  if (n.includes('oftalmo')) return 'Agudeza visual, prescripción de lentes, fondo de ojos y presión ocular.';
  return 'Atención primaria integral para adultos, chequeos clínicos y seguimiento de patologías.';
};
