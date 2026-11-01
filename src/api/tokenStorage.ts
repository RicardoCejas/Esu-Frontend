// Gestor de Access Token en memoria volátil para mitigar ataques XSS (HU-41)
// El token nunca se almacena en localStorage ni sessionStorage.

let memoryAccessToken: string | null = null;
let tokenListeners: Array<(token: string | null) => void> = [];

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
