import { apiClient } from './apiClient';
import { extractApiErrorMessage, isDemoModeEnabled } from './endpoints';

export interface SesionActivaItem {
  id: string;
  dispositivo: string; // ej: "Windows PC", "iPhone 14", "Android Tablet"
  navegador: string; // ej: "Chrome 128", "Safari 17", "Firefox 130"
  ubicacion: string; // ej: "Cruz del Eje, Córdoba, Argentina"
  ip: string;
  fechaInicio: string; // ISO string
  esActual: boolean;
}

const STORAGE_KEY_SESIONES = 'esu_sesiones_activas';

const MOCK_SESIONES_INICIALES: SesionActivaItem[] = [
  {
    id: 'ses-1',
    dispositivo: 'Windows PC (Escritorio)',
    navegador: 'Google Chrome 128',
    ubicacion: 'Cruz del Eje, Córdoba, Argentina',
    ip: '190.137.45.12',
    fechaInicio: new Date().toISOString(),
    esActual: true,
  },
  {
    id: 'ses-2',
    dispositivo: 'iPhone 14 Pro',
    navegador: 'Mobile Safari 17.5',
    ubicacion: 'Cruz del Eje, Córdoba, Argentina',
    ip: '181.168.10.94',
    fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // Hace 4 horas
    esActual: false,
  },
  {
    id: 'ses-3',
    dispositivo: 'Tablet Samsung Galaxy Tab',
    navegador: 'Chrome Mobile 126',
    ubicacion: 'Córdoba Capital, Argentina',
    ip: '200.45.122.88',
    fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Hace 2 días
    esActual: false,
  },
];

const getStoredSesiones = (): SesionActivaItem[] => {
  if (typeof window === 'undefined') return MOCK_SESIONES_INICIALES;
  const saved = localStorage.getItem(STORAGE_KEY_SESIONES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return MOCK_SESIONES_INICIALES;
};

let sesionesState: SesionActivaItem[] = getStoredSesiones();

const saveState = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SESIONES, JSON.stringify(sesionesState));
  }
};

export const sesionesService = {
  async getSesiones(): Promise<SesionActivaItem[]> {
    try {
      const res = await apiClient.get<SesionActivaItem[]>('/auth/sesiones');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: unknown) {
      if (isDemoModeEnabled()) {
        return [...sesionesState];
      }
      throw new Error(extractApiErrorMessage(err, 'No se pudieron obtener las sesiones activas.'), { cause: err });
    }
  },

  async cerrarSesionRemota(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/auth/sesiones/${id}`);
      sesionesState = sesionesState.filter((s) => s.id !== id);
      saveState();
      return true;
    } catch (err: unknown) {
      if (isDemoModeEnabled()) {
        sesionesState = sesionesState.filter((s) => s.id !== id);
        saveState();
        return true;
      }
      throw new Error(extractApiErrorMessage(err, 'No se pudo revocar la sesión remota.'), { cause: err });
    }
  },

  async cerrarTodasLasDemasSesiones(passwordActual: string): Promise<{ success: boolean; revocadas: number }> {
    if (!passwordActual || passwordActual.trim().length === 0) {
      throw new Error('Debe ingresar su contraseña actual para confirmar la revocación.');
    }

    try {
      const res = await apiClient.post<{ success: boolean; revocadas?: number }>('/auth/sesiones/revocar-todas', { password: passwordActual });
      const cantidadAnterior = sesionesState.length;
      sesionesState = sesionesState.filter((s) => s.esActual);
      saveState();
      return {
        success: res.data?.success ?? true,
        revocadas: res.data?.revocadas ?? Math.max(0, cantidadAnterior - 1),
      };
    } catch (err: unknown) {
      if (isDemoModeEnabled()) {
        const cantidadAnterior = sesionesState.length;
        sesionesState = sesionesState.filter((s) => s.esActual);
        saveState();
        return {
          success: true,
          revocadas: Math.max(0, cantidadAnterior - 1),
        };
      }
      throw new Error(extractApiErrorMessage(err, 'No se pudieron revocar las demás sesiones.'), { cause: err });
    }
  },
};
