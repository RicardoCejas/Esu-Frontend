import { z } from 'zod';

export const patientBookingSchema = z.object({
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede superar los 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  phone: z
    .string()
    .min(10, 'Ingrese un teléfono válido con código de área (ej: 3549420000)')
    .regex(/^[0-9+\s-]+$/, 'Formato de teléfono no válido'),
  email: z
    .string()
    .email('Ingrese un correo electrónico válido (ej: nombre@dominio.com)')
    .or(z.literal('')),
  healthInsurance: z.string().default('Particular (Sin cobertura)'),
  affiliateNumber: z.string().optional().or(z.literal('')),
  notes: z.string().max(300, 'Las observaciones no pueden superar los 300 caracteres').optional(),
});

export type PatientBookingFormData = z.infer<typeof patientBookingSchema>;
