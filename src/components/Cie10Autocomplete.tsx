import React, { useState, useEffect, useRef } from 'react';
import { clinicaService } from '@/api/clinicaService';
import type { Cie10Diagnostico } from '@/types';
import { Search, X, Check, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  selected?: Cie10Diagnostico | null;
  onSelect: (item: Cie10Diagnostico | null) => void;
  required?: boolean;
}

export const Cie10Autocomplete: React.FC<Props> = ({ selected, onSelect, required = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cie10Diagnostico[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al clickear afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (selected) return;
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await clinicaService.buscarCie10(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Error buscando CIE-10:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (diag: Cie10Diagnostico) => {
    onSelect(diag);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Diagnóstico Codificado Oficial (CIE-10)
          {required && <span className="text-rose-500 font-bold">*</span>}
        </span>
        {selected ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            CIE-10 Asociado
          </span>
        ) : (
          <span className="text-xs text-amber-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Requerido para firma
          </span>
        )}
      </label>

      {selected ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-xs font-black bg-emerald-600 text-white rounded-md tracking-wider">
              {selected.codigo}
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-snug">{selected.descripcion}</p>
              {selected.capitulo && (
                <p className="text-xs text-emerald-700">{selected.capitulo}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Quitar diagnóstico"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código (ej. J00, I10) o descripción (ej. Rinofaringitis, Hipertensión)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {loading && (
              <div className="absolute right-3.5 top-3 text-xs text-emerald-600 animate-pulse font-medium">
                Buscando...
              </div>
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-gray-100">
              {results.map((item) => (
                <button
                  type="button"
                  key={item.codigo}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-emerald-50 transition-colors cursor-pointer group"
                >
                  <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-800 rounded group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {item.codigo}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-950 truncate">
                      {item.descripcion}
                    </p>
                    {item.capitulo && (
                      <p className="text-xs text-gray-500 truncate">{item.capitulo}</p>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          )}

          {isOpen && !loading && query.trim().length > 1 && results.length === 0 && (
            <div className="absolute z-50 w-full mt-1.5 p-4 bg-white border border-gray-200 rounded-xl shadow-lg text-center text-sm text-gray-500">
              No se hallaron coincidencias en el catálogo oficial para "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
