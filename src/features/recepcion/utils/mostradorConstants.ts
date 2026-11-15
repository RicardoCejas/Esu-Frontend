export const CONVENIOS_POPULARES = [
  'Particular / Sin Obra Social',
  'APROSS',
  'PAMI',
  'OSDE',
  'Swiss Medical',
  'Federada Salud',
  'Sancor Salud',
  'Medifé',
  'OSPAC',
  'Otra',
];

export const extractSlotHHmm = (raw: string): string => {
  const clean = String(raw ?? '').trim();
  return clean.includes('T') ? (clean.split('T')[1]?.slice(0, 5) ?? clean.slice(0, 5)) : clean.slice(0, 5);
};
