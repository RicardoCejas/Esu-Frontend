import type { HealthCenter, MedicalSpecialty, MedicalDoctor, AppointmentSlot, DiagnosticStudy } from '../types'

export const MOCK_CENTERS: HealthCenter[] = [
  {
    id: 'cde-hosp-crespo',
    name: 'Hospital Provincial Dr. Aurelio Crespo',
    type: 'HOSPITAL',
    address: 'Av. Juan B. Justo 1200',
    neighborhood: 'Barrio Hospital',
    city: 'Cruz del Eje',
    phone: '03549 42-2001',
    specialtiesCount: 28,
    availableSpecialtyIds: [
      'esp-pediatria', 'esp-clinica', 'esp-traumatologia', 'esp-ginecologia', 'esp-psiquiatria',
      'esp-urologia', 'esp-neurologia', 'esp-cardiologia', 'esp-hemoterapia', 'esp-fisiatria',
      'esp-oftalmo', 'esp-diabetologia', 'esp-cirugia', 'esp-psicologia', 'esp-odonto',
      'esp-trabajo-social', 'esp-nutricion', 'esp-fonoaudiologia', 'esp-kinesiologia', 'esp-fisioterapia',
      'esp-psicomotricidad', 'esp-psicopedagogia', 'esp-dermatologia', 'esp-endocrino', 'esp-flebologia',
      'esp-gastro', 'esp-oncologia', 'esp-otorrino'
    ],
    permiteConsultas: true,
    permiteEstudios: true,
    estudiosDisponibles: [
      'Laboratorio de Análisis Clínicos',
      'Radiografía Digital',
      'Ecografía General',
      'Ecografía Mamaria'
    ],
  },
  {
    id: 'cde-clin-cabrera',
    name: 'Clínica Cabrera',
    type: 'CLINICA',
    address: 'Sarmiento 450',
    neighborhood: 'Centro',
    city: 'Cruz del Eje',
    phone: '03549 42-3110',
    specialtiesCount: 16,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-pediatria', 'esp-cardiologia', 'esp-traumatologia', 'esp-ginecologia',
      'esp-cirugia', 'esp-dermatologia', 'esp-gastro', 'esp-neurologia', 'esp-urologia',
      'esp-otorrino', 'esp-oftalmo', 'esp-kinesiologia', 'esp-nutricion', 'esp-endocrino', 'esp-psicologia'
    ],
    permiteConsultas: true,
    permiteEstudios: true,
    estudiosDisponibles: [
      'Laboratorio de Análisis Clínicos',
      'Radiografía Digital',
      'Ecografía General'
    ],
  },
  {
    id: 'cde-sanat-isabel',
    name: 'Sanatorio María Isabel',
    type: 'CLINICA',
    address: 'España 230',
    neighborhood: 'Centro',
    city: 'Cruz del Eje',
    phone: '03549 42-2250',
    specialtiesCount: 14,
    availableSpecialtyIds: [
      'esp-clinica', 'esp-pediatria', 'esp-cardiologia', 'esp-ginecologia', 'esp-traumatologia',
      'esp-cirugia', 'esp-psiquiatria', 'esp-urologia', 'esp-neurologia', 'esp-oftalmo',
      'esp-dermatologia', 'esp-nutricion', 'esp-psicologia', 'esp-odonto'
    ],
    permiteConsultas: true,
    permiteEstudios: false,
    estudiosDisponibles: [],
  },
  {
    id: 'cde-centro-diag',
    name: 'Centro de Diagnóstico por Imágenes Cruz del Eje',
    type: 'CONSULTORIO',
    address: 'Rivadavia 210',
    neighborhood: 'Centro',
    city: 'Cruz del Eje',
    phone: '03549 42-1550',
    specialtiesCount: 0,
    availableSpecialtyIds: [],
    permiteConsultas: false,
    permiteEstudios: true,
    estudiosDisponibles: [
      'Laboratorio de Análisis Clínicos',
      'Radiografía Digital',
      'Ecografía General',
      'Ecografía Mamaria'
    ],
  },
]

export const MOCK_DIAGNOSTIC_STUDIES: DiagnosticStudy[] = [
  {
    id: 'est-laboratorio',
    name: 'Laboratorio de Análisis Clínicos',
    description: 'Hemograma completo, química clínica, glucemia, perfil lipídico, orina completa y microbiología.',
    iconName: 'FlaskConical',
    category: 'LABORATORIO',
  },
  {
    id: 'est-radiografia',
    name: 'Radiografía Digital',
    description: 'Estudios radiológicos de tórax frente/perfil, óseos, articulares y columna vertebral.',
    iconName: 'Activity',
    category: 'IMAGENES',
  },
  {
    id: 'est-eco-general',
    name: 'Ecografía General',
    description: 'Ecografía abdominal, hepatobiliopancreática, renal, vesical, partes blandas y tiroidea.',
    iconName: 'HeartPulse',
    category: 'ECOGRAFIA',
  },
  {
    id: 'est-eco-mamaria',
    name: 'Ecografía Mamaria',
    description: 'Evaluación ecográfica mamaria bilateral de alta resolución y prevención oncológica.',
    iconName: 'Shield',
    category: 'ECOGRAFIA',
  },
]

export const MOCK_SPECIALTIES: MedicalSpecialty[] = [
  {
    id: 'esp-pediatria',
    name: 'Pediatría',
    description: 'Atención integral del recién nacido, lactante, niños y adolescentes.',
    iconName: 'Baby',
    totalDoctors: 4,
  },
  {
    id: 'esp-clinica',
    name: 'Clínica Médica',
    description: 'Atención primaria integral para adultos, chequeos clínicos y manejo de patologías crónicas.',
    iconName: 'Stethoscope',
    totalDoctors: 6,
  },
  {
    id: 'esp-traumatologia',
    name: 'Traumatología',
    description: 'Patologías óseas, articulares, fracturas, columna y traumatología deportiva.',
    iconName: 'Bone',
    totalDoctors: 4,
  },
  {
    id: 'esp-ginecologia',
    name: 'Ginecología y Obstetricia',
    description: 'Salud reproductiva, control prenatal, PAP, colposcopía y chequeos ginecológicos periódicos.',
    iconName: 'UserCheck',
    totalDoctors: 4,
  },
  {
    id: 'esp-psiquiatria',
    name: 'Psiquiatría',
    description: 'Diagnóstico y tratamiento de trastornos del estado de ánimo, ansiedad y psicofarmacología.',
    iconName: 'Brain',
    totalDoctors: 3,
  },
  {
    id: 'esp-urologia',
    name: 'Urología',
    description: 'Salud urológica integral masculina y femenina, próstata y litiasis urinaria.',
    iconName: 'Activity',
    totalDoctors: 3,
  },
  {
    id: 'esp-neurologia',
    name: 'Neurología',
    description: 'Cefaleas, migrañas, epilepsia, trastornos cognitivos y enfermedades neuromusculares.',
    iconName: 'Brain',
    totalDoctors: 3,
  },
  {
    id: 'esp-cardiologia',
    name: 'Cardiología',
    description: 'Prevención cardiovascular, electrocardiogramas, Holter y control de hipertensión.',
    iconName: 'HeartPulse',
    totalDoctors: 4,
  },
  {
    id: 'esp-hemoterapia',
    name: 'Hemoterapia',
    description: 'Medicina transfusional, control hematológico y bancos de sangre.',
    iconName: 'Activity',
    totalDoctors: 2,
  },
  {
    id: 'esp-fisiatria',
    name: 'Fisiatría',
    description: 'Medicina física y rehabilitación funcional integral.',
    iconName: 'Activity',
    totalDoctors: 2,
  },
  {
    id: 'esp-oftalmo',
    name: 'Oftalmología',
    description: 'Agudeza visual, prescripción de lentes, fondo de ojos y presión ocular.',
    iconName: 'Eye',
    totalDoctors: 3,
  },
  {
    id: 'esp-diabetologia',
    name: 'Diabetología',
    description: 'Prevención, diagnóstico y tratamiento integral de diabetes y síndrome metabólico.',
    iconName: 'Activity',
    totalDoctors: 2,
  },
  {
    id: 'esp-cirugia',
    name: 'Cirugía General',
    description: 'Evaluación quirúrgica preoperatoria, procedimientos ambulatorios y seguimiento posoperatorio.',
    iconName: 'Scissors',
    totalDoctors: 3,
  },
  {
    id: 'esp-psicologia',
    name: 'Psicología',
    description: 'Psicoterapia individual para adolescentes y adultos, orientación y apoyo emocional.',
    iconName: 'HeartHandshake',
    totalDoctors: 4,
  },
  {
    id: 'esp-odonto',
    name: 'Odontología',
    description: 'Odontología preventiva, operatoria dental, extracciones y endodoncia.',
    iconName: 'Smile',
    totalDoctors: 4,
  },
  {
    id: 'esp-trabajo-social',
    name: 'Trabajo Social',
    description: 'Acompañamiento psicosocial, gestión de recursos y asistencia familiar comunitaria.',
    iconName: 'Users',
    totalDoctors: 2,
  },
  {
    id: 'esp-nutricion',
    name: 'Nutrición',
    description: 'Planes de alimentación clínica, nutrición deportiva, sobrepeso y patologías metabólicas.',
    iconName: 'Apple',
    totalDoctors: 4,
  },
  {
    id: 'esp-fonoaudiologia',
    name: 'Fonoaudiología',
    description: 'Trastornos de la voz, audición, deglución y comunicación humana.',
    iconName: 'Ear',
    totalDoctors: 2,
  },
  {
    id: 'esp-kinesiologia',
    name: 'Kinesiología',
    description: 'Rehabilitación motora, respiratoria, biomecánica y reinserción postural.',
    iconName: 'Activity',
    totalDoctors: 4,
  },
  {
    id: 'esp-fisioterapia',
    name: 'Fisioterapia',
    description: 'Terapias físicas de recuperación muscular y analgesia articular.',
    iconName: 'Activity',
    totalDoctors: 3,
  },
  {
    id: 'esp-psicomotricidad',
    name: 'Psicomotricidad',
    description: 'Desarrollo psicomotor infantil y estimulación temprana.',
    iconName: 'Baby',
    totalDoctors: 2,
  },
  {
    id: 'esp-psicopedagogia',
    name: 'Psicopedagogía',
    description: 'Evaluación diagnóstica y tratamiento de las dificultades en los procesos de aprendizaje.',
    iconName: 'Brain',
    totalDoctors: 2,
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
    name: 'Endocrinología',
    description: 'Trastornos de tiroides, desequilibrios hormonales y metabolismo.',
    iconName: 'Activity',
    totalDoctors: 3,
  },
  {
    id: 'esp-flebologia',
    name: 'Flebología',
    description: 'Diagnóstico y tratamiento de várices, insuficiencia venosa y linfología.',
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
    id: 'esp-oncologia',
    name: 'Oncología',
    description: 'Consultas especializadas, seguimiento oncológico integral y terapias adyuvantes.',
    iconName: 'Shield',
    totalDoctors: 2,
  },
  {
    id: 'esp-otorrino',
    name: 'Otorrinolaringología (ORL)',
    description: 'Patologías de oído, nariz y garganta, hipoacusia y audiometrías.',
    iconName: 'Ear',
    totalDoctors: 3,
  },
]

export const MOCK_DOCTORS: MedicalDoctor[] = [
  // Clínica Médica
  {
    id: 'doc-fernandez',
    name: 'Dra. María Elena Fernández',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
    licenseNumber: 'MP 28.451',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Viernes'],
    nextAvailableDate: 'Mañana, 08:30 hs',
  },
  {
    id: 'doc-martinez',
    name: 'Dr. Roberto Carlos Martínez',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-hosp-crespo', 'cde-sanat-isabel'],
    licenseNumber: 'MP 19.324',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Jueves'],
    nextAvailableDate: 'Jueves 25, 09:00 hs',
  },
  {
    id: 'doc-castro',
    name: 'Dra. Florencia Castro',
    specialtyId: 'esp-clinica',
    centerIds: ['cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
    licenseNumber: 'MP 33.109',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Jueves'],
    nextAvailableDate: 'Hoy, 16:30 hs',
  },
  {
    id: 'doc-alvarez',
    name: 'Dr. Esteban Álvarez',
    specialtyId: 'esp-pediatria',
    centerIds: ['cde-hosp-crespo', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
    licenseNumber: 'MP 15.670',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles'],
    nextAvailableDate: 'Lunes 29, 11:00 hs',
  },
  {
    id: 'doc-lucero',
    name: 'Dra. Mariana Lucero',
    specialtyId: 'esp-cardiologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
    licenseNumber: 'MP 29.544',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Viernes'],
    nextAvailableDate: 'Mañana, 17:00 hs',
  },
  {
    id: 'doc-acosta',
    name: 'Dr. Hugo Acosta',
    specialtyId: 'esp-traumatologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
    licenseNumber: 'MP 22.188',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles', 'Jueves'],
    nextAvailableDate: 'Miércoles 24, 15:30 hs',
  },
  {
    id: 'doc-molina',
    name: 'Dr. Fernando Molina',
    specialtyId: 'esp-ginecologia',
    centerIds: ['cde-hosp-crespo', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
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
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera'],
    licenseNumber: 'MP 19.880',
    consultationType: 'PRESENCIAL',
    availableDays: ['Miércoles', 'Viernes'],
    nextAvailableDate: 'Viernes 26, 09:00 hs',
  },

  // Psiquiatría
  {
    id: 'doc-ramos',
    name: 'Dra. Carolina Ramos',
    specialtyId: 'esp-psiquiatria',
    centerIds: ['cde-hosp-crespo', 'cde-sanat-isabel'],
    licenseNumber: 'MP 27.810',
    consultationType: 'PRESENCIAL',
    availableDays: ['Lunes', 'Miércoles'],
    nextAvailableDate: 'Miércoles 24, 11:30 hs',
  },

  // Psicología
  {
    id: 'doc-albarracin',
    name: 'Lic. Lucía Albarracín',
    specialtyId: 'esp-psicologia',
    centerIds: ['cde-hosp-crespo', 'cde-clin-cabrera', 'cde-sanat-isabel'],
    licenseNumber: 'MP 14.390',
    consultationType: 'PRESENCIAL',
    availableDays: ['Martes', 'Miércoles', 'Viernes'],
    nextAvailableDate: 'Mañana, 15:00 hs',
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
