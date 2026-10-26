import { z } from 'zod';

export const loginSchema = z.object({
  emailOrDni: z
    .string()
    .min(3, 'Ingrese su email o DNI para continuar')
    .max(100, 'El valor ingresado es demasiado largo'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede superar los 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  email: z.string().email('Ingrese un email válido'),
  telefono: z.string().min(10, 'Ingrese un teléfono de contacto válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme su contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
