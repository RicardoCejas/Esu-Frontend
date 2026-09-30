import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { StaffMedicosSection } from '@/features/home/StaffMedicosSection';
import { centrosService } from '@/api/centrosService';
import { profesionalesService } from '@/api/profesionalesService';
import type { CentroSalud, Especialidad, Profesional } from '@/types';
import { Building2, MapPin, Phone, Clock, HeartPulse, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfesionalesPage: React.FC = () => {
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [centroDetalle, setCentroDetalle] = useState<CentroSalud | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [c, e, p] = await Promise.all([
        centrosService.getAll(),
        profesionalesService.getEspecialidades(),
        profesionalesService.getAll(),
      ]);
      setCentros(c);
      setEspecialidades(e);
      setProfesionales(p);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-teal-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1">
        <StaffMedicosSection
          profesionales={profesionales}
          centros={centros}
          especialidades={especialidades}
          onSelectCentro={(centro) => setCentroDetalle(centro)}
        />
      </main>

      {/* Modal Detalles Centro */}
      {centroDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            <div className="bg-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-teal-200" />
                <div>
                  <h3 className="font-bold text-base font-heading">{centroDetalle.nombre}</h3>
                  <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full font-bold">
                    {centroDetalle.tipo} • {centroDetalle.ciudad}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCentroDetalle(null)}
                className="text-white hover:bg-white/20 rounded-full p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 rounded-2xl bg-muted/40 p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">Dirección:</span>
                    <span className="text-muted-foreground">{centroDetalle.direccion}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground inline mr-1">Teléfono:</span>
                    <span className="font-mono text-teal-700 font-semibold">{centroDetalle.telefono}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground inline mr-1">Horario:</span>
                    <span className="text-muted-foreground">{centroDetalle.horarioAtencion}</span>
                  </div>
                </div>
              </div>

              {centroDetalle.disponibleGuardia && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive font-bold flex items-center gap-2">
                  <HeartPulse className="h-4 w-4" />
                  <span>Servicio de Guardia Permanente 24 horas</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 rounded-full border border-input py-2 font-bold hover:bg-accent transition"
                >
                  Volver
                </button>
                <Link
                  to="/turnero"
                  onClick={() => setCentroDetalle(null)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-teal-600 py-2 font-bold text-white hover:bg-teal-700 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Sacar Turno</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
