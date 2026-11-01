// Canal de comunicación inter-pestañas para sincronización segura de autenticación (HU-44)

export type AuthBroadcastMessage =
  | { type: 'LOGOUT'; reason?: 'user' | 'inactivity' | 'expired' }
  | { type: 'LOGIN'; userId: string }
  | { type: 'SESSION_EXTENDED' };

class AuthBroadcastManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(msg: AuthBroadcastMessage) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('esu_auth_sync_channel');
        this.channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
          this.notify(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel no soportado o deshabilitado en este navegador:', err);
      }
    }
  }

  public postMessage(message: AuthBroadcastMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('Error al emitir en BroadcastChannel:', err);
      }
    }
  }

  public subscribe(listener: (msg: AuthBroadcastMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(message: AuthBroadcastMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error en listener de BroadcastChannel:', err);
      }
    });
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const authBroadcast = new AuthBroadcastManager();
