/**
 * Canonical Argentine DNI validation and normalization helpers shared across ESU modules.
 */
export const DNI_REGEX = /^\d{7,8}$/;

export const DNI_VALIDATION_ERROR = 'El DNI debe contener 7 u 8 dígitos numéricos.';

/**
 * Strips any non-numeric characters from a raw DNI input string.
 */
export function normalizeDniDigits(value?: string | null): string {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Validates that a DNI string (trimmed) matches 7 or 8 numeric digits.
 */
export function isValidDniFormat(value?: string | null): boolean {
  const clean = String(value ?? '').trim();
  return DNI_REGEX.test(clean);
}
