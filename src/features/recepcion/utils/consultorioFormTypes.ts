export interface ConsultorioFormValues {
  numero: string;
  planta: string;
  especialidadAsignada: string;
  activo: boolean;
}

export type ConsultorioFormErrors = Partial<Record<keyof ConsultorioFormValues, string>>;
