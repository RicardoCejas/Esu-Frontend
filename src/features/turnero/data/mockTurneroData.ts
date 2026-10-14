import type { HealthCenter, MedicalSpecialty, MedicalDoctor, AppointmentSlot } from '../types'

export const MOCK_CENTERS: HealthCenter[] = [
  {
    id: 'cde-hosp-crespo',
    name: 'Hospital Regional Aurelio Crespo',
    type: 'HOSPITAL',
    address: 'Av. Juan B. Justo 1200',
    neighborhood: 'Barrio Hospital',
    city: 'Cruz del Eje',
    phone: '03549 42-2001',
    specialtiesCount: 22,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-pediatria', 'esp-cardiologia', 'esp-traumatologia', 'esp-ginecologia',
      'esp-oftalmo', 'esp-odonto', 'esp-cirugia', 'esp-neurologia', 'esp-urologia',
      'esp-neumonologia', 'esp-gastro', 'esp-endocrino', 'esp-dermatologia', 'esp-kinesiologia',
      'esp-nutricion', 'esp-psiquiatria', 'esp-psicologia', 'esp-otorrino', 'esp-nefrologia',
      'esp-oncologia', 'esp-reumatologia'
    ],
  },
  {
    id: 'cde-clin-privada',
    name: 'Clínica Privada Cruz del Eje',
    type: 'CLINICA',
    address: 'Sarmiento 450',
    neighborhood: 'Centro',
    city: 'Cruz del Eje',
    phone: '03549 42-3110',
    specialtiesCount: 16,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-cardiologia', 'esp-traumatologia', 'esp-ginecologia', 'esp-pediatria',
      'esp-cirugia', 'esp-dermatologia', 'esp-gastro', 'esp-neurologia', 'esp-urologia',
      'esp-otorrino', 'esp-oftalmo', 'esp-kinesiologia', 'esp-nutricion', 'esp-endocrino', 'esp-reumatologia'
    ],
  },
  {
    id: 'cde-caps-cayetano',
    name: 'Centro de Salud Municipal San Cayetano',
    type: 'CAPS',
    address: 'Pellegrini esq. Mitre',
    neighborhood: 'San Cayetano',
    city: 'Cruz del Eje',
    phone: '03549 42-4500',
    specialtiesCount: 8,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-pediatria', 'esp-odonto', 'esp-ginecologia',
      'esp-nutricion', 'esp-psicologia', 'esp-kinesiologia', 'esp-dermatologia'
    ],
  },
  {
    id: 'cde-caps-favaloro',
    name: 'Centro Asistencial Comunitario Dr. René Favaloro',
    type: 'CAPS',
    address: 'España 780',
    neighborhood: 'Barrio Central',
    city: 'Cruz del Eje',
    phone: '03549 42-6789',
    specialtiesCount: 7,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-pediatria', 'esp-ginecologia', 'esp-odonto',
      'esp-nutricion', 'esp-psicologia', 'esp-kinesiologia'
    ],
  },
  {
    id: 'cde-cons-valle',
    name: 'Consultorios Médicos del Valle',
    type: 'CONSULTORIO',
    address: 'Rivadavia 210',
    neighborhood: 'Centro',
    city: 'Cruz del Eje',
    phone: '03549 42-1550',
    specialtiesCount: 12,
    availableSpecialtyIds: [
      'esp-cardiologia', 'esp-traumatologia', 'esp-oftalmo', 'esp-clinica', 'esp-dermatologia',
      'esp-endocrino', 'esp-neurologia', 'esp-urologia', 'esp-gastro', 'esp-nutricion',
      'esp-otorrino', 'esp-reumatologia'
    ],
  },
]

export const MOCK_SPECIALTIES: MedicalSpecialty[] = [
  {
    id: 'esp-alergia',
    name: 'Alergia e Inmunología',
    description: 'Diagnóstico y tratamiento de rinitis, asma alérgico y dermatitis atópica.',
    iconName: 'Shield',
    totalDoctors: 2,
  },
  {
    id: 'esp-cardiologia',
    name: 'Cardiología Clínica',
    description: 'Prevención cardiovascular, electrocardiogramas, Holter y control de hipertensión.',
    iconName: 'HeartPulse',
    totalDoctors: 4,
  },
  {
    id: 'esp-cirugia',
    name: 'Cirugía General y Laparoscópica',
    description: 'Evaluación quirúrgica preoperatoria, procedimientos ambulatorios y seguimiento posoperatorio.',
    iconName: 'Scissors',
    totalDoctors: 3,
  },
  {
    id: 'esp-clinica',
    name: 'Clínica Médica / Medicina General',
    description: 'Atención primaria integral para adultos, chequeos clínicos y manejo de patologías crónicas.',
    iconName: 'Stethoscope',
    totalDoctors: 6,
  },
  {
    id: 'esp-dermatologia',
    name: 'Dermatología',
    description: 'Cuidado y tratamiento de afecciones de la piel, control de lunares y dermatocirugía.',
    iconName: 'Sun',
    totalDoctors: 3,
  },
  {
    id: 'esp-endocrino',
    name: 'Endocrinología y Metabolismo',
    description: 'Trastornos de tiroides, diabetes mellitus, obesidad y desequilibrios hormonales.',
    iconName: 'Activity',
    totalDoctors: 2,
  },
  {
    id: 'esp-gastro',
    name: 'Gastroenterología',
    description: 'Enfermedades del tracto digestivo, reflujo, hígado y endoscopías diagnósticas.',
    iconName: 'Activity',
    totalDoctors: 3,
  },
  {
    id: 'esp-ginecologia',
    name: 'Ginecología y Obstetricia',
    description: 'Salud reproductiva, control prenatal, PAP, colposcopía y chequeos ginecológicos periódicos.',
    iconName: 'UserCheck',
    totalDoctors: 4,
  },
  {
    id: 'esp-kinesiologia',
    name: 'Kinesiología y Fisioterapia',
    description: 'Rehabilitación física, traumatológica, respiratoria y reinserción postural.',
    iconName: 'Activity',
    totalDoctors: 5,
  },
  {
    id: 'esp-nefrologia',
    name: 'Nefrología',
    description: 'Insuficiencia renal, litiasis, hipertensión arterial refractaria y hemodiálisis.',
    iconName: 'Activity',
    totalDoctors: 2,
  },
  {
    id: 'esp-neumonologia',
    name: 'Neumonología',
    description: 'Espirometrías, asma, EPOC, infecciones pulmonares y patologías respiratorias.',
    iconName: 'Wind',
    totalDoctors: 2,
  },
  {
    id: 'esp-neurologia',
    name: 'Neurología',
    description: 'Cefaleas, migrañas, epilepsia, trastornos cognitivos y enfermedades neuromusculares.',
    iconName: 'Brain',
    totalDoctors: 3,
  },
  {
    id: 'esp-nutricion',
    name: 'Nutrición y Dietética',
    description: 'Planes de alimentación clínica, nutrición deportiva, sobrepeso y patologías metabólicas.',
    iconName: 'Apple',
    totalDoctors: 4,
  },
  {
    id: 'esp-odonto',
    name: 'Odontología Integral',
    description: 'Odontología preventiva, operatoria dental, extracciones y endodoncia.',
    iconName: 'Smile',
    totalDoctors: 4,
  },
  {
    id: 'esp-oftalmo',
    name: 'Oftalmología',
    description: 'Agudeza visual, prescripción de lentes, fondo de ojos y presión ocular.',
    iconName: 'Eye',
    totalDoctors: 3,
  },
  {
    id: 'esp-oncologia',
    name: 'Oncología Clínica',
    description: 'Consultas especializadas, seguimiento oncológico integral y terapias adyuvantes.',
    iconName: 'ShieldAlert',
    totalDoctors: 2,
  },
  {
    id: 'esp-otorrino',
    name: 'Otorrinolaringología (ORL)',
    description: 'Patologías de oído, nariz y garganta, hipoacusia y audiometrías.',
    iconName: 'Ear',
    totalDoctors: 3,
  },
  {
    id: 'esp-pediatria',
    name: 'Pediatría y Neonatología',
    description: 'Atención integral del recién nacido, lactante, niños y adolescentes hasta 14 años.',
    iconName: 'Baby',
    totalDoctors: 5,
  },
  {
    id: 'esp-psicologia',
    name: 'Psicología Clínica',
    description: 'Psicoterapia individual para adolescentes y adultos, orientación y apoyo emocional.',
    iconName: 'HeartHandshake',
    totalDoctors: 4,
  },
  {
    id: 'esp-psiquiatria',
    name: 'Psiquiatría',
    description: 'Diagnóstico y tratamiento de trastornos del estado de ánimo, ansiedad y psicofarmacología.',
    iconName: 'Sparkles',
    totalDoctors: 2,
  },
  {
    id: 'esp-reumatologia',
    name: 'Reumatología',
    description: 'Artritis reumatoidea, artrosis, lupus, fibromialgia y patologías autoinmunes.',
    iconName: 'Bone',
    totalDoctors: 2,
  },
  {
    id: 'esp-traumatologia',
    name: 'Traumatología y Ortopedia',
    description: 'Patologías óseas, articulares, fracturas, columna y traumatología deportiva.',
    iconName: 'Bone',
    totalDoctors: 4,
  },
  {
    id: 'esp-urologia',
    name: 'Urología',
    description: 'Salud urológica integral masculina y femenina, próstata y litiasis urinaria.',
    iconName: 'Activity',
    totalDoctors: 3,
  },
]

export const MOCK_DOCTORS: MedicalDoctor[] = [
  // Clínica Médica
  {
    id: 'doc-fernandez',
    name: 'Dra. María Elena Fernández',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada'],
    licenseNumber: 'MP 28.451',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Viernes'],
    nextAvailableDate: 'Mañana, 08:30 hs',
  },
  {
    id: 'doc-martinez',
    name: 'Dr. Roberto Carlos Martínez',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano', 'cde-caps-favaloro'],
    licenseNumber: 'MP 19.324',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 09:00 hs',
  },
  {
    id: 'doc-castro',
    name: 'Dra. Florencia Castro',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-cons-valle', 'cde-clin-privada'],
    licenseNumber: 'MP 31.220',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Martes', 'Jueves'],
    nextAvailableDate: 'Lunes 28, 10:30 hs',
  },

  // Pediatría
  {
    id: 'doc-gomez',
    name: 'Dra. Laura Silvina Gómez',
    specialtyId: 'esp-pediatria',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano', 'cde-caps-favaloro'],
    licenseNumber: 'MP 33.109',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Jueves'],
    nextAvailableDate: 'Hoy, 16:30 hs',
  },
  {
    id: 'doc-alvarez',
    name: 'Dr. Esteban Álvarez',
    specialtyId: 'esp-pediatria',
    centerIds: ['cde-clin-privada', 'cde-hosp-crespo'],
    licenseNumber: 'MP 24.890',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 10:00 hs',
  },

  // Cardiología
  {
    id: 'doc-rossi',
    name: 'Dr. Alejandro Rossi',
    specialtyId: 'esp-cardiologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 15.670',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles'],
    nextAvailableDate: 'Lunes 29, 11:00 hs',
  },
  {
    id: 'doc-lucero',
    name: 'Dra. Mariana Lucero',
    specialtyId: 'esp-cardiologia',
    centerIds: ['cde-hosp-crespo', 'cde-cons-valle'],
    licenseNumber: 'MP 27.810',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Viernes'],
    nextAvailableDate: 'Martes 30, 08:30 hs',
  },

  // Traumatología
  {
    id: 'doc-benitez',
    name: 'Dra. Valeria Benítez',
    specialtyId: 'esp-traumatologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 29.544',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Viernes'],
    nextAvailableDate: 'Mañana, 17:00 hs',
  },
  {
    id: 'doc-acosta',
    name: 'Dr. Hugo Acosta',
    specialtyId: 'esp-traumatologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada'],
    licenseNumber: 'MP 18.905',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 14:00 hs',
  },

  // Ginecología
  {
    id: 'doc-torres',
    name: 'Dra. Silvina Torres',
    specialtyId: 'esp-ginecologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-caps-favaloro'],
    licenseNumber: 'MP 22.188',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Jueves'],
    nextAvailableDate: 'Miércoles 24, 15:30 hs',
  },
  {
    id: 'doc-molina',
    name: 'Dr. Fernando Molina',
    specialtyId: 'esp-ginecologia',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano'],
    licenseNumber: 'MP 25.430',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 09:30 hs',
  },

  // Oftalmología
  {
    id: 'doc-navarro',
    name: 'Dr. Gustavo Navarro',
    specialtyId: 'esp-oftalmo',
    centerIds: ['cde-hosp-crespo', 'cde-cons-valle', 'cde-clin-privada'],
    licenseNumber: 'MP 20.401',
    consultationType: 'PRESENCIAL',
    availableDays: ['Jueves', 'Viernes'],
    nextAvailableDate: 'Jueves 25, 08:30 hs',
  },

  // Odontología
  {
    id: 'doc-morales',
    name: 'Dra. Patricia Morales',
    specialtyId: 'esp-odonto',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano', 'cde-caps-favaloro'],
    licenseNumber: 'MP 12.873',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Martes', 'Miércoles'],
    nextAvailableDate: 'Mañana, 09:30 hs',
  },

  // Dermatología
  {
    id: 'doc-suarez',
    name: 'Dra. Beatriz Suárez',
    specialtyId: 'esp-dermatologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 26.790',
    consultationType: 'PRESENCIAL',
    availableDays: ['Miércoles', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 11:30 hs',
  },

  // Neurología
  {
    id: 'doc-peralta',
    name: 'Dr. Claudio Peralta',
    specialtyId: 'esp-neurologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 16.920',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Jueves'],
    nextAvailableDate: 'Lunes 28, 14:30 hs',
  },

  // Urología
  {
    id: 'doc-dominguez',
    name: 'Dr. Javier Domínguez',
    specialtyId: 'esp-urologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 21.340',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 16:00 hs',
  },

  // Cirugía General
  {
    id: 'doc-vargas',
    name: 'Dr. Martín Vargas',
    specialtyId: 'esp-cirugia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada'],
    licenseNumber: 'MP 17.512',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Viernes'],
    nextAvailableDate: 'Miércoles 24, 08:00 hs',
  },

  // Gastroenterología
  {
    id: 'doc-ibarra',
    name: 'Dra. Marcela Ibarra',
    specialtyId: 'esp-gastro',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 23.411',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 15:00 hs',
  },

  // Endocrinología
  {
    id: 'doc-sanchez',
    name: 'Dra. Gabriela Sánchez',
    specialtyId: 'esp-endocrino',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 28.190',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 11:00 hs',
  },

  // Kinesiología
  {
    id: 'doc-romero',
    name: 'Lic. Gonzalo Romero',
    specialtyId: 'esp-kinesiologia',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano', 'cde-caps-favaloro', 'cde-clin-privada'],
    licenseNumber: 'MP 9.420',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Viernes'],
    nextAvailableDate: 'Hoy, 17:30 hs',
  },

  // Nutrición
  {
    id: 'doc-paredes',
    name: 'Lic. Romina Paredes',
    specialtyId: 'esp-nutricion',
    centerIds: ['cde-hosp-crespo', 'cde-caps-cayetano', 'cde-cons-valle'],
    licenseNumber: 'MP 11.230',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 10:00 hs',
  },

  // Otorrinolaringología
  {
    id: 'doc-correa',
    name: 'Dr. Andrés Correa',
    specialtyId: 'esp-otorrino',
    centerIds: ['cde-hosp-crespo', 'cde-clin-privada', 'cde-cons-valle'],
    licenseNumber: 'MP 19.880',
    consultationType: 'PRESENCIAL',
    availableDays: ['Miércoles', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 09:00 hs',
  },
]

export const MOCK_MORNING_SLOTS: AppointmentSlot[] = [
  { id: 'slot-m1', time: '08:00', period: 'MORNING', isAvailable: true },
  { id: 'slot-m2', time: '08:30', period: 'MORNING', isAvailable: true },
  { id: 'slot-m3', time: '09:00', period: 'MORNING', isAvailable: false },
  { id: 'slot-m4', time: '09:30', period: 'MORNING', isAvailable: true },
  { id: 'slot-m5', time: '10:00', period: 'MORNING', isAvailable: true },
  { id: 'slot-m6', time: '10:30', period: 'MORNING', isAvailable: false },
  { id: 'slot-m7', time: '11:00', period: 'MORNING', isAvailable: true },
  { id: 'slot-m8', time: '11:30', period: 'MORNING', isAvailable: true },
]

export const MOCK_AFTERNOON_SLOTS: AppointmentSlot[] = [
  { id: 'slot-a1', time: '16:00', period: 'AFTERNOON', isAvailable: true },
  { id: 'slot-a2', time: '16:30', period: 'AFTERNOON', isAvailable: true },
  { id: 'slot-a3', time: '17:00', period: 'AFTERNOON', isAvailable: true },
  { id: 'slot-a4', time: '17:30', period: 'AFTERNOON', isAvailable: false },
  { id: 'slot-a5', time: '18:00', period: 'AFTERNOON', isAvailable: true },
  { id: 'slot-a6', time: '18:30', period: 'AFTERNOON', isAvailable: true },
  { id: 'slot-a7', time: '19:00', period: 'AFTERNOON', isAvailable: true },
]

export const AVAILABLE_INSURANCES = [
  'Particular (Sin cobertura)',
  'APROSS (Administración Provincial del Seguro de Salud)',
  'PAMI (Instituto Nacional de Servicios Sociales para Jubilados)',
  'OSDE Binario',
  'Swiss Medical',
  'Federada Salud',
  'Sancor Salud',
  'Medifé',
  'OSECAC',
  'OSPRERA',
]
