// Utilidad de sanitización de entradas contra ataques XSS y extracción anti-CSRF (HU-44)

/**
 * Sanitiza cadenas de texto para prevenir inyecciones XSS comunes
 * Elimina etiquetas HTML peligrosas, scripts y pseudo-protocolos javascript:
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Reemplaza caracteres HTML clave por sus entidades seguras
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remueve intentos de javascript: o vbscript:
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remueve handlers de eventos tipo onload=, onerror=, etc.
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitiza recursivamente objetos de formulario antes de ser enviados por Axios
 */
export function sanitizeFormData<T>(data: T): T {
  if (typeof data === 'string') {
    return sanitizeInput(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFormData(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeFormData(value);
    }
    return sanitizedObj as unknown as T;
  }
  return data;
}

/**
 * Extrae el valor de la cookie CSRF (por defecto XSRF-TOKEN) para sincronización con el backend
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN|CSRF-TOKEN)=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}
