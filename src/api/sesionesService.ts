import { apiClient } from './apiClient';

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
      return res.data;
    } catch {
      return [...sesionesState];
    }
  },

  async cerrarSesionRemota(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/auth/sesiones/${id}`);
    } catch {
      // fallback
    }
    sesionesState = sesionesState.filter((s) => s.id !== id);
    saveState();
    return true;
  },

  async cerrarTodasLasDemasSesiones(passwordActual: string): Promise<{ success: boolean; revocadas: number }> {
    if (!passwordActual || passwordActual.trim().length === 0) {
      throw new Error('Debe ingresar su contraseña actual para confirmar la revocación.');
    }

    try {
      await apiClient.post('/auth/sesiones/revocar-todas', { password: passwordActual });
    } catch {
      // fallback
    }

    const cantidadAnterior = sesionesState.length;
    // Mantiene solo la sesión actual
    sesionesState = sesionesState.filter((s) => s.esActual);
    saveState();

    return {
      success: true,
      revocadas: Math.max(0, cantidadAnterior - 1),
    };
  },
};
