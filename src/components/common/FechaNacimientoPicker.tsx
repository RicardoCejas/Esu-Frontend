import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

interface FechaNacimientoPickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string | null;
  className?: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const FechaNacimientoPicker: React.FC<FechaNacimientoPickerProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'dd/mm/aaaa',
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsing value inicial (YYYY-MM-DD)
  const parseDate = (str: string) => {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  };

  const parsed = parseDate(value);
  const today = new Date();
  const currentYear = today.getFullYear();

  // Estados internos del picker
  const [selectedYear, setSelectedYear] = useState<number>(parsed?.year || 1995);
  const [selectedMonth, setSelectedMonth] = useState<number>(parsed?.month ?? 5);
  const [selectedDay, setSelectedDay] = useState<number | null>(parsed?.day ?? null);

  // Modo de vista: 'dias' | 'meses' | 'anios'
  const [viewMode, setViewMode] = useState<'dias' | 'meses' | 'anios'>('dias');

  // Década actual para vista de años
  const [decadeStart, setDecadeStart] = useState<number>(
    Math.floor((parsed?.year || 1995) / 12) * 12
  );

  // Estado para el texto manual visible (DD/MM/AAAA)
  const formatDisplay = (y: number, m: number, d: number) => {
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    return `${dd}/${mm}/${y}`;
  };

  const [textInput, setTextInput] = useState<string>(
    parsed ? formatDisplay(parsed.year, parsed.month, parsed.day) : ''
  );

  // Sincronizar si cambia value desde afuera
  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedDay(p.day);
      setTextInput(formatDisplay(p.year, p.month, p.day));
      setDecadeStart(Math.floor(p.year / 12) * 12);
    } else if (!value) {
      setSelectedDay(null);
      setTextInput('');
    }
  }, [value]);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Manejo de cambio de texto manual
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 8);
    let formatted: string;
    if (raw.length <= 2) {
      formatted = raw;
    } else if (raw.length <= 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }
    setTextInput(formatted);

    if (raw.length === 8) {
      const d = parseInt(raw.slice(0, 2), 10);
      const m = parseInt(raw.slice(2, 4), 10) - 1;
      const y = parseInt(raw.slice(4, 8), 10);

      if (y >= 1900 && y <= currentYear && m >= 0 && m <= 11 && d >= 1 && d <= 31) {
        const testDate = new Date(y, m, d);
        if (
          testDate.getFullYear() === y &&
          testDate.getMonth() === m &&
          testDate.getDate() === d &&
          testDate <= today
        ) {
          const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          setSelectedYear(y);
          setSelectedMonth(m);
          setSelectedDay(d);
          onChange(iso);
        }
      }
    }
  };

  const handleDaySelect = (day: number) => {
    const candidate = new Date(selectedYear, selectedMonth, day);
    if (candidate > today) return; // No permitir fechas futuras

    setSelectedDay(day);
    const iso = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setTextInput(formatDisplay(selectedYear, selectedMonth, day));
    onChange(iso);
    setIsOpen(false);
  };

  // Cantidad de días en el mes seleccionado
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  // Primer día de la semana (0 = Domingo -> adaptar para que 0 sea Lunes)
  const firstDayIndex = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;

  // Cálculo de edad si hay fecha válida
  const calcularEdad = () => {
    if (!selectedDay) return null;
    const birth = new Date(selectedYear, selectedMonth, selectedDay);
    if (isNaN(birth.getTime()) || birth > today) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const edad = calcularEdad();

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Campo visible estilo input interactivo */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          disabled={disabled}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition"
          aria-label="Abrir calendario"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={textInput}
          onChange={handleTextInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-24 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
        />

        {/* Indicador de edad o botón limpiar */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {edad !== null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200/80">
              <Sparkles className="h-2.5 w-2.5 text-sky-500" />
              {edad} años
            </span>
          )}
          {textInput && !disabled && (
            <button
              type="button"
              onClick={() => {
                setTextInput('');
                setSelectedDay(null);
                onChange('');
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Borrar fecha"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-[11px] text-rose-600 font-medium">{error}</p>}

      {/* Popover del Selector Intuitivo */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-80 top-full mt-1.5 z-50 rounded-2xl bg-white p-4 shadow-2xl border border-sky-100 ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Superior del Selector */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              {/* Botón selector de Mes */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'meses' ? 'dias' : 'meses')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'meses'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {MESES[selectedMonth]}
              </button>

              {/* Botón selector de Año */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'anios' ? 'dias' : 'anios')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'anios'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                {selectedYear}
              </button>
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'dias') {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear((y) => y - 1);
                    } else {
                      setSelectedMonth((m) => m - 1);
                    }
                  } else if (viewMode === 'meses') {
                    setSelectedYear((y) => y - 1);
                  } else {
                    setDecadeStart((d) => d - 12);
                  }
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                title="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'dias') {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear((y) => y + 1);
                    } else {
                      setSelectedMonth((m) => m + 1);
                    }
                  } else if (viewMode === 'meses') {
                    setSelectedYear((y) => y + 1);
                  } else {
                    setDecadeStart((d) => d + 12);
                  }
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                title="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* VISTA 1: Selector de Años (Rápido por décadas) */}
          {viewMode === 'anios' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                <span>Selecciona tu año de nacimiento:</span>
                <span className="font-mono text-sky-700">{decadeStart} - {decadeStart + 11}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((year) => {
                  const isFuture = year > currentYear;
                  const isSelected = year === selectedYear;
                  return (
                    <button
                      key={year}
                      type="button"
                      disabled={isFuture}
                      onClick={() => {
                        setSelectedYear(year);
                        setViewMode('meses');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl transition ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-sm'
                          : isFuture
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-100'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
              {/* Acceso rápido a décadas comunes */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 justify-center text-[10px]">
                {[2000, 1990, 1980, 1970, 1960].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDecadeStart(d)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-800 font-semibold transition"
                  >
                    Años {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 2: Selector de Meses */}
          {viewMode === 'meses' && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 px-1">
                Mes de nacimiento ({selectedYear}):
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MESES.map((mes, idx) => {
                  const isFuture = selectedYear === currentYear && idx > today.getMonth();
                  const isSelected = idx === selectedMonth;
                  return (
                    <button
                      key={mes}
                      type="button"
                      disabled={isFuture}
                      onClick={() => {
                        setSelectedMonth(idx);
                        setViewMode('dias');
                      }}
                      className={`py-2.5 text-xs font-semibold rounded-xl transition truncate px-1 ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-sm font-bold'
                          : isFuture
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                          : 'bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-100'
                      }`}
                    >
                      {mes.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 3: Selector de Días del Mes */}
          {viewMode === 'dias' && (
            <div>
              {/* Encabezado días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                {DIAS_SEMANA.map((d) => (
                  <span key={d} className="py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Espacios vacíos antes del día 1 */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 w-8" />
                ))}

                {/* Días del mes */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayDate = new Date(selectedYear, selectedMonth, day);
                  const isFuture = dayDate > today;
                  const isSelected =
                    selectedDay === day &&
                    parsed?.year === selectedYear &&
                    parsed?.month === selectedMonth;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleDaySelect(day)}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-md'
                          : isFuture
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-sky-100 hover:text-sky-900 cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Pie de ayuda */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  Haz clic en año/mes para cambiar rápido
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-sky-700 hover:text-sky-900"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
