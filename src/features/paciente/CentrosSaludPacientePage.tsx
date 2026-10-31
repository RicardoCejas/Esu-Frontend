import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CentrosSaludPacientePage: React.FC = () => {
  const centros = [
    {
      id: 'c1',
      nombre: 'Hospital Provincial Dr. Aurelio Crespo',
      tipo: 'Hospital Público Provincial de Agudos (Cabecera)',
      direccion: 'Av. Juan Domingo Perón 450, Cruz del Eje',
      telefono: '03549-422111 / Emergencias: 107',
      horario: 'Guardia Médica General y Pediátrica: 24 Horas Permanente',
      servicios: ['Guardia 24hs', 'Unidad de Terapia Intensiva (UTI)', 'Quirófanos', 'Internación', 'Laboratorio Central'],
      badge: 'Hospital Cabecera Regional',
    },
    {
      id: 'c2',
      nombre: 'Clínica Médica Cabrera',
      tipo: 'Clínica Privada con Convenio de Obras Sociales',
      direccion: 'Av. Eva Perón 642, Cruz del Eje',
      telefono: '03549-424150',
      horario: 'Lunes a Viernes de 08:00 a 20:00 hs',
      servicios: ['Consultorios Ambulatorios', 'Medicina General', 'Especialidades', 'Convenio APROSS / PAMI'],
      badge: 'Atención Obras Sociales',
    },
    {
      id: 'c3',
      nombre: 'Centro de Diagnóstico Cruz del Eje',
      tipo: 'Centro de Diagnóstico de Alta Complejidad e Imágenes',
      direccion: 'Sarmiento 340, Cruz del Eje',
      telefono: '03549-421880 / WhatsApp: 3549-552233',
      horario: 'Lunes a Viernes de 07:30 a 20:00 hs',
      servicios: ['Tomografía Computada', 'Ecografía 4D & Doppler', 'Radiología Digital', 'Mamografía'],
      badge: 'Diagnóstico e Imágenes',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900">
          Centros de Salud y Red Asistencial
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Guía de hospitales, sanatorios, clínicas y centros de diagnóstico de la red unificada de Cruz del Eje con teléfonos útiles y guardias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {centros.map((centro) => (
          <div
            key={centro.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-sky-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  {centro.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight font-heading">
                  {centro.nombre}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{centro.tipo}</p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2.5 border-t border-slate-100">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{centro.direccion}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{centro.telefono}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-xs">{centro.horario}</span>
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Servicios principales:
                </span>
                <div className="flex flex-wrap gap-1">
                  {centro.servicios.map((s, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/turnero"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white py-2.5 text-xs font-bold transition shadow-xs"
            >
              <span>Solicitar Turno en este Centro</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
