import axios from 'axios';

export type ApiErrorKind =
  | 'UNAUTHORIZED' // 401
  | 'FORBIDDEN' // 403
  | 'CONFLICT' // 409
  | 'SERVER_ERROR' // 5xx
  | 'NETWORK_ERROR' // Network/timeout/offline
  | 'VALIDATION' // 400 / 422
  | 'NOT_FOUND' // 404
  | 'UNKNOWN';

export interface ClassifiedApiError {
  status?: number;
  kind: ApiErrorKind;
  message: string;
  isRetryable: boolean;
  requiresLogin: boolean;
  originalError: unknown;
}

export function classifyApiError(
  error: unknown,
  fallbackMessage = 'Error de comunicación con el servidor.'
): ClassifiedApiError {
  if (!error) {
    return {
      kind: 'UNKNOWN',
      message: fallbackMessage,
      isRetryable: false,
      requiresLogin: false,
      originalError: error,
    };
  }

  // Axios error o similar con response / request
  if (axios.isAxiosError(error) || (typeof error === 'object' && error !== null && ('response' in error || 'request' in error))) {
    const axiosErr = error as {
      response?: {
        status?: number;
        data?: {
          detail?: string;
          message?: string;
          mensaje?: string;
          error?: string;
          title?: string;
        };
      };
      code?: string;
      message?: string;
    };

    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;
    const backendMsg =
      (typeof data?.detail === 'string' && data.detail.trim()) ||
      (typeof data?.mensaje === 'string' && data.mensaje.trim()) ||
      (typeof data?.message === 'string' && data.message.trim()) ||
      (typeof data?.error === 'string' && data.error.trim()) ||
      (typeof data?.title === 'string' && data.title.trim()) ||
      '';

    if (status === 401) {
      return {
        status,
        kind: 'UNAUTHORIZED',
        message: backendMsg || 'Su sesión ha expirado o no es válida. Por favor, vuelva a iniciar sesión.',
        isRetryable: false,
        requiresLogin: true,
        originalError: error,
      };
    }

    if (status === 403) {
      return {
        status,
        kind: 'FORBIDDEN',
        message: backendMsg || 'No posee los permisos requeridos para realizar esta acción.',
        isRetryable: false,
        requiresLogin: false,
        originalError: error,
      };
    }

    if (status === 409) {
      return {
        status,
        kind: 'CONFLICT',
        message: backendMsg || 'Conflicto con el estado actual del recurso en el servidor.',
        isRetryable: false,
        requiresLogin: false,
        originalError: error,
      };
    }

    if (status === 404) {
      return {
        status,
        kind: 'NOT_FOUND',
        message: backendMsg || 'El recurso solicitado no fue encontrado en el servidor.',
        isRetryable: false,
        requiresLogin: false,
        originalError: error,
      };
    }

    if (status && status >= 500) {
      return {
        status,
        kind: 'SERVER_ERROR',
        message: backendMsg || 'Error interno del servidor. Por favor reintente más tarde.',
        isRetryable: true,
        requiresLogin: false,
        originalError: error,
      };
    }

    if (status === 400 || status === 422) {
      return {
        status,
        kind: 'VALIDATION',
        message: backendMsg || 'Los datos enviados no son válidos o están incompletos.',
        isRetryable: false,
        requiresLogin: false,
        originalError: error,
      };
    }

    // Sin response: error de red, offline o timeout
    if (!axiosErr.response) {
      const isTimeout =
        axiosErr.code === 'ECONNABORTED' ||
        (typeof axiosErr.message === 'string' && axiosErr.message.toLowerCase().includes('timeout'));
      return {
        kind: 'NETWORK_ERROR',
        message: isTimeout
          ? 'El servidor está tardando en responder. Por favor reintente en unos instantes.'
          : 'No se pudo conectar con el servidor. Compruebe su conexión a internet.',
        isRetryable: true,
        requiresLogin: false,
        originalError: error,
      };
    }

    if (backendMsg) {
      return {
        status,
        kind: 'UNKNOWN',
        message: backendMsg,
        isRetryable: false,
        requiresLogin: false,
        originalError: error,
      };
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return {
      kind: 'UNKNOWN',
      message: error.message.trim(),
      isRetryable: false,
      requiresLogin: false,
      originalError: error,
    };
  }

  if (typeof error === 'string' && error.trim()) {
    return {
      kind: 'UNKNOWN',
      message: error.trim(),
      isRetryable: false,
      requiresLogin: false,
      originalError: error,
    };
  }

  return {
    kind: 'UNKNOWN',
    message: fallbackMessage,
    isRetryable: false,
    requiresLogin: false,
    originalError: error,
  };
}

export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage = 'Error de comunicación con el servidor.'
): string {
  return classifyApiError(error, fallbackMessage).message;
}
