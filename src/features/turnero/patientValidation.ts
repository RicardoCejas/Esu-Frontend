import { z } from 'zod'
import { DNI_REGEX, DNI_VALIDATION_ERROR } from '../../lib/dniValidation.ts'

export const patientBookingSchema = z.object({
  dni: z.string().trim().regex(DNI_REGEX, DNI_VALIDATION_ERROR),
  firstName: z.string().trim().min(2, 'Ingrese al menos 2 caracteres para el nombre.'),
  lastName: z.string().trim().min(2, 'Ingrese al menos 2 caracteres para el apellido.'),
  phone: z.string().trim()
    .regex(/^\+?[\d\s()-]{6,20}$/, 'Ingrese un teléfono válido.')
    .refine((value) => value.replace(/\D/g, '').length >= 6, 'Ingrese al menos 6 dígitos.'),
  email: z.union([z.literal(''), z.string().email('Ingrese un correo electrónico válido.')]),
  healthInsurance: z.string().trim().min(1, 'Seleccione una cobertura médica.'),
  affiliateNumber: z.string().optional().default(''),
  notes: z.string().optional(),
})
