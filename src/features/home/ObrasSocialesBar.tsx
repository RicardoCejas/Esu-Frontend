import React, { useState } from 'react';
import { Shield, CheckCircle2, Info, Building2, Calendar, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ObraSocialInfo {
  id: string;
  nombre: string;
  sigla: string;
  color: string;
  bgGradient: string;
  textColor: string;
  tipo: string;
  cobertura: string;
  centrosAceptados: string[];
  requisitos: string[];
}

export const MOCK_OBRAS_SOCIALES: ObraSocialInfo[] = [
  {
    id: 'apross',
    nombre: 'Administración Provincial del Seguro de Salud',
    sigla: 'APROSS',
    color: '#0284c7',
    bgGradient: 'from-sky-500/15 to-blue-600/10 border-sky-300/40 text-sky-900',
    textColor: 'text-sky-700',
    tipo: 'Provincial Córdoba',
    cobertura: 'Cobertura al 100% en consultas y estudios ambulatorios.',
    centrosAceptados: ['Hospital Aurelio Crespo', 'Clínica Privada Cruz del Eje', 'Consultorios del Valle'],
    requisitos: ['DNI actualizado', 'Credencial digital en App Apross', 'Bono o token de atención'],
  },
  {
    id: 'pami',
    nombre: 'Instituto Nacional de Servicios Sociales para Jubilados y Pensionados',
    sigla: 'PAMI',
    color: '#0d9488',
    bgGradient: 'from-teal-500/15 to-emerald-600/10 border-teal-300/40 text-teal-900',
    textColor: 'text-teal-700',
    tipo: 'Nacional Jubilados',
    cobertura: 'Médico de cabecera, especialistas y medicamentos gratuitos según vademécum.',
    centrosAceptados: ['Hospital Aurelio Crespo', 'Clínica Privada Cruz del Eje', 'Dispensario San Pantaleón'],
    requisitos: ['Último recibo de cobro', 'DNI', 'Credencial PAMI física o digital'],
  },
  {
    id: 'osde',
    nombre: 'Organización de Servicios Directos Empresarios',
    sigla: 'OSDE',
    color: '#0284c7',
    bgGradient: 'from-blue-600/15 to-indigo-600/10 border-blue-300/40 text-blue-900',
    textColor: 'text-blue-700',
    tipo: 'Prepaga Nacional',
    cobertura: 'Planes 210, 310, 410 y 450 con cartilla médica directa y reintegros.',
    centrosAceptados: ['Clínica Privada Cruz del Eje', 'Consultorios del Valle'],
    requisitos: ['Credencial digital OSDE Móvil', 'DNI'],
  },
  {
    id: 'swiss-medical',
    nombre: 'Swiss Medical Group',
    sigla: 'SWISS MEDICAL',
    color: '#dc2626',
    bgGradient: 'from-rose-500/15 to-red-600/10 border-rose-300/40 text-rose-900',
    textColor: 'text-rose-700',
    tipo: 'Prepaga Nacional',
    cobertura: 'Acceso a especialistas, estudios de alta complejidad e internación.',
    centrosAceptados: ['Clínica Privada Cruz del Eje'],
    requisitos: ['App Swiss Medical con credencial virtual', 'DNI'],
  },
  {
    id: 'sancor',
    nombre: 'SanCor Salud Grupo de Medicina Privada',
    sigla: 'SANCOR SALUD',
    color: '#16a34a',
    bgGradient: 'from-emerald-500/15 to-green-600/10 border-emerald-300/40 text-emerald-900',
    textColor: 'text-emerald-700',
    tipo: 'Medicina Privada',
    cobertura: 'Planes integrales con amplia red de prestadores en el Valle y Noroeste Cordobés.',
    centrosAceptados: ['Clínica Privada Cruz del Eje', 'Consultorios del Valle'],
    requisitos: ['Credencial SanCor Digital', 'DNI'],
  },
  {
    id: 'daspu',
    nombre: 'Dirección de Asistencia Social del Personal Universitario (UNC)',
    sigla: 'DASPU',
    color: '#7c3aed',
    bgGradient: 'from-violet-500/15 to-purple-600/10 border-violet-300/40 text-violet-900',
    textColor: 'text-violet-700',
    tipo: 'Universitaria',
    cobertura: 'Convenio de atención médica en centros de salud de Cruz del Eje.',
    centrosAceptados: ['Hospital Aurelio Crespo', 'Clínica Privada Cruz del Eje'],
    requisitos: ['Orden de consulta emitida o número de afiliado'],
  },
  {
    id: 'osecac',
    nombre: 'Obra Social de Empleados de Comercio y Actividades Civiles',
    sigla: 'OSECAC',
    color: '#ea580c',
    bgGradient: 'from-amber-500/15 to-orange-600/10 border-amber-300/40 text-amber-900',
    textColor: 'text-orange-700',
    tipo: 'Obra Social Sindical',
    cobertura: 'Atención primaria y de especialistas para trabajadores de comercio y familiares.',
    centrosAceptados: ['Hospital Aurelio Crespo', 'Consultorios del Valle'],
    requisitos: ['Recibo de sueldo del titular', 'Carnet digital', 'DNI'],
  },
  {
    id: 'publica',
    nombre: 'Cobertura Universal y Gratuita de Salud Pública',
    sigla: 'SALUD PÚBLICA / SIN OBRA SOCIAL',
    color: '#0d9488',
    bgGradient: 'from-teal-600/20 to-teal-900/15 border-teal-500/50 text-teal-950',
    textColor: 'text-teal-800',
    tipo: 'Atención Gratuita',
    cobertura: '100% gratuita y garantizada para cualquier persona con DNI argentino o pasaporte.',
    centrosAceptados: ['Hospital Provincial Aurelio Crespo', 'Dispensario San Pantaleón'],
    requisitos: ['DNI o documento de identidad', 'No requiere obra social ni pago alguno'],
  },
];

export const ObrasSocialesBar: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<ObraSocialInfo | null>(null);

  return (
    <section className="py-12 bg-card border-b border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-200 mb-2">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              <span>Convenios de Cobertura y Atención</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
              Obras Sociales y Coberturas Aceptadas
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Atención pública 100% gratuita y convenios con las principales obras sociales y prepagas del país.
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
            <Info className="h-4 w-4 text-teal-600 shrink-0" />
            <span>Haz clic en cualquier obra social para ver detalles y requisitos de turno.</span>
          </p>
        </div>

        {/* Grilla Interactiva de Logos e Insignias de Obras Sociales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {MOCK_OBRAS_SOCIALES.map((os) => (
            <button
              key={os.id}
              onClick={() => setSelectedOS(os)}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer bg-gradient-to-br ${os.bgGradient}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-black/5 text-foreground">
                    {os.tipo}
                  </span>
                  <CheckCircle2 className={`h-4 w-4 ${os.textColor}`} />
                </div>
                <div className="pt-1">
                  <h4 className={`text-base font-extrabold font-heading ${os.textColor}`}>
                    {os.sigla}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {os.nombre}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-bold">
                <span className={os.textColor}>Ver requisitos</span>
                <ArrowRight className={`h-3 w-3 ${os.textColor}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL DETALLES DE LA OBRA SOCIAL SELECCIONADA */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner font-extrabold text-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
                    {selectedOS.tipo}
                  </span>
                  <h3 className="text-xl font-bold font-heading">{selectedOS.sigla}</h3>
                  <p className="text-xs text-teal-100">{selectedOS.nombre}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOS(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5 text-xs">
              {/* Cobertura */}
              <div className="rounded-2xl bg-teal-50/70 border border-teal-200/60 p-4 space-y-1">
                <span className="font-bold text-teal-900 block text-xs">Alcance y Cobertura:</span>
                <p className="text-teal-800 text-xs leading-relaxed">{selectedOS.cobertura}</p>
              </div>

              {/* Centros de Salud en Cruz del Eje donde se atiende */}
              <div className="space-y-2">
                <span className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Building2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Centros en Cruz del Eje con convenio:</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedOS.centrosAceptados.map((centro, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-muted/40 border border-border px-3 py-2 font-medium"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{centro}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requisitos para el Turno */}
              <div className="space-y-2">
                <span className="font-bold text-foreground block uppercase text-[11px] tracking-wider">
                  Documentación a presentar el día del turno:
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                  {selectedOS.requisitos.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Botón para sacar turno con esta Obra Social */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOS(null)}
                  className="flex-1 rounded-full border border-input py-2.5 font-bold hover:bg-accent transition cursor-pointer"
                >
                  Cerrar
                </button>
                <Link
                  to="/turnero"
                  onClick={() => setSelectedOS(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700 transition shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sacar Turno con {selectedOS.sigla}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
