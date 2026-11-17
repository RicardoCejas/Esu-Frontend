// Gestor de Access Token en memoria volátil para mitigar ataques XSS (HU-41)
// El token nunca se almacena en localStorage ni sessionStorage.

let memoryAccessToken: string | null = null;
let tokenListeners: Array<(token: string | null) => void> = [];
let inFlightRefreshPromise: Promise<string | null> | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return memoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    memoryAccessToken = token;
    tokenListeners.forEach((listener) => listener(token));
  },

  clearToken(): void {
    memoryAccessToken = null;
    tokenListeners.forEach((listener) => listener(null));
  },

  subscribe(listener: (token: string | null) => void): () => void {
    tokenListeners.push(listener);
    return () => {
      tokenListeners = tokenListeners.filter((l) => l !== listener);
    };
  },
};

/**
 * Sincronización single-flight para /auth/refresh.
 * Evita que montajes simultáneos (StrictMode) o múltiples reintentos 401 disparen
 * rotaciones paralelas con el mismo cookie de refresh token y disparen falsas alertas de reuso.
 */
export const refreshSingleFlight = {
  async run(task: () => Promise<string | null>): Promise<string | null> {
    if (inFlightRefreshPromise) {
      return inFlightRefreshPromise;
    }
    inFlightRefreshPromise = (async () => {
      try {
        return await task();
      } finally {
        inFlightRefreshPromise = null;
      }
    })();
    return inFlightRefreshPromise;
  },
};
