export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleAccountsIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  prompt: (
    notification?: (notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
    }) => void
  ) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with';
      shape?: 'rectangular' | 'pill' | 'circle';
      width?: number | string;
      logo_alignment?: 'left' | 'center';
    }
  ) => void;
}

export interface GoogleAuthEnv {
  VITE_GOOGLE_AUTH_ENABLED?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
}

export function isGoogleAuthEnabled(env: GoogleAuthEnv): boolean {
  const flag = env.VITE_GOOGLE_AUTH_ENABLED;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return Boolean(env.VITE_GOOGLE_CLIENT_ID?.trim());
}

export const GOOGLE_GSI_SCRIPT_ID = 'google-gsi-client';
export const GOOGLE_GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let initializedClientId: string | null = null;
let initializedGsiApi: GoogleAccountsIdApi | null = null;
let activeCredentialHandler: ((response: GoogleCredentialResponse) => void) | null = null;

export function setActiveGoogleCredentialHandler(
  handler: ((response: GoogleCredentialResponse) => void) | null
): () => void {
  activeCredentialHandler = handler;
  return () => {
    if (activeCredentialHandler === handler) {
      activeCredentialHandler = null;
    }
  };
}

/**
 * Inicializa Google Identity Services una única vez por instancia de API y clientId.
 * Evita registros duplicados del listener global de postMessage en React StrictMode
 * y al navegar entre rutas con botones de Google.
 */
export function initializeGoogleSignInOnce(
  gsiId: GoogleAccountsIdApi,
  clientId: string
): boolean {
  if (initializedGsiApi === gsiId && initializedClientId === clientId) {
    return false;
  }

  gsiId.initialize({
    client_id: clientId,
    callback: (response) => {
      activeCredentialHandler?.(response);
    },
  });

  initializedGsiApi = gsiId;
  initializedClientId = clientId;
  return true;
}

export function resetGsiStateForTests(): void {
  initializedClientId = null;
  initializedGsiApi = null;
  activeCredentialHandler = null;
}

export interface ScriptElementLike {
  id: string;
  src: string;
  async: boolean;
  defer: boolean;
  dataset: Record<string, string | undefined>;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
  remove: () => void;
}

export interface GsiScriptHost<T extends ScriptElementLike = ScriptElementLike> {
  getScriptById: (id: string) => unknown;
  createScript: () => T;
  appendScript: (node: T) => unknown;
}

function isScriptElementLike(value: unknown): value is ScriptElementLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'addEventListener' in value &&
    'removeEventListener' in value &&
    'dataset' in value &&
    'remove' in value
  );
}

export function attachGsiScript<T extends ScriptElementLike>(
  host: GsiScriptHost<T>,
  onLoad: () => void,
  onError: () => void
): () => void {
  const existing = host.getScriptById(GOOGLE_GSI_SCRIPT_ID);
  let script: ScriptElementLike | null = isScriptElementLike(existing) ? existing : null;

  // Si un intento previo falló o terminó sin inicializar google.accounts.id, recrear el tag para reintentar
  if (script && (script.dataset.gsiState === 'error' || script.dataset.gsiState === 'loaded')) {
    script.remove();
    script = null;
  }

  const handleLoad = () => {
    if (script) {
      script.dataset.gsiState = 'loaded';
    }
    onLoad();
  };

  const handleError = () => {
    if (script) {
      script.dataset.gsiState = 'error';
    }
    onError();
  };

  if (!script) {
    const created = host.createScript();
    created.id = GOOGLE_GSI_SCRIPT_ID;
    created.src = GOOGLE_GSI_SCRIPT_SRC;
    created.async = true;
    created.defer = true;
    created.dataset.gsiState = 'loading';
    created.addEventListener('load', handleLoad);
    created.addEventListener('error', handleError);
    host.appendScript(created);
    script = created;
  } else {
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
  }

  return () => {
    script?.removeEventListener('load', handleLoad);
    script?.removeEventListener('error', handleError);
  };
}
