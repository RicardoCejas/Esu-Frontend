import React from 'react';
import { Link } from 'react-router-dom';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { type CentroMapaPin } from './mapaCentrosData';
import { useMapaCruzDelEje } from './hooks/useMapaCruzDelEje';
import { MapaCentroDetailCard } from './components/MapaCentroDetailCard';
import { MapaCentroPills } from './components/MapaCentroPills';

interface MapaCruzDelEjeProps {
  className?: string;
  onSelectPin?: (pin: CentroMapaPin) => void;
}

export const MapaCruzDelEje: React.FC<MapaCruzDelEjeProps> = ({ className = '', onSelectPin }) => {
  const { user } = useAuth();
  const isAdminOrDev = user?.rol === 'ADMIN' || localStorage.getItem('esu_dev_mode') === 'true';

  const {
    mapContainerRef,
    centros,
    selectedCentro,
    setSelectedCentro,
    mapStyleKey,
    handleSelectCentro,
    handleChangeStyle,
    handleResetCamera,
  } = useMapaCruzDelEje(onSelectPin);

  return (
    <section
      className={`w-full py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200 ${className}`}
      id="mapa-cruz-del-eje"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284C7] text-white text-xs font-bold mb-2.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mapa Sanitario • Cruz del Eje</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#003855]">
              Mapa Sanitario • Cruz del Eje
            </h2>
            <p className="text-sm sm:text-lg text-slate-700 mt-2 max-w-3xl leading-relaxed">
              Explorá la red de efectores de salud en Cruz del Eje. Seleccioná cualquier pin para ver su dirección actualizada, servicios habilitados y accesos directos a vista satelital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-xs">
              {(['vista1', 'vista2'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={mapStyleKey === key}
                  onClick={() => handleChangeStyle(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                    mapStyleKey === key ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {key === 'vista1' ? 'Vista 1' : 'Vista 2'}
                </button>
              ))}
            </div>

            {isAdminOrDev && (
              <Link
                to="/dashboard/admin/mapa"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] transition shadow-xs"
              >
                <Settings className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                <span>Panel Calibrar Pines (Admin)</span>
              </Link>
            )}
          </div>
        </div>

        <MapaCentroPills
          centros={centros}
          selectedId={selectedCentro?.id}
          onResetCamera={handleResetCamera}
          onSelectCentro={handleSelectCentro}
        />

        <div className="relative rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-[540px] sm:h-[620px] cursor-grab active:cursor-grabbing" />

          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-extrabold text-slate-800 border border-slate-200 shadow-md pointer-events-none">
            <Navigation className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
            <span>Cruz del Eje • {centros.length} Efectores de Salud</span>
          </div>

          {!selectedCentro && centros[0] && (
            <button
              type="button"
              onClick={() => handleSelectCentro(centros[0])}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-2xl bg-[#0284C7] text-white px-4 py-2.5 text-xs font-bold shadow-lg hover:bg-[#0369A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7] transition cursor-pointer"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Ver ficha de {centros[0].nombreCorto}</span>
            </button>
          )}

          {selectedCentro && (
            <MapaCentroDetailCard centro={selectedCentro} onClose={() => setSelectedCentro(null)} />
          )}
        </div>
      </div>
    </section>
  );
};
