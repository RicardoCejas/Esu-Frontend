import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PlusCircle, Search, LogIn, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CityOption {
  id: string
  name: string
  province: string
  isAvailable: boolean
}

export const SUPPORTED_CITIES: CityOption[] = [
  { id: 'cde', name: 'Cruz del Eje', province: 'Córdoba', isAvailable: true },
  { id: 'sms', name: 'San Marcos Sierras', province: 'Córdoba', isAvailable: false },
  { id: 'vds', name: 'Villa de Soto', province: 'Córdoba', isAvailable: false },
  { id: 'srz', name: 'Serrezuela', province: 'Córdoba', isAvailable: false },
]

interface AppHeaderProps {
  selectedCity: CityOption
  onCityChange: (city: CityOption) => void
  onNewBooking: () => void
  onLookupBooking: () => void
  onLoginClick?: () => void
}

export function AppHeader({
  selectedCity,
  onCityChange,
  onNewBooking,
  onLookupBooking,
}: AppHeaderProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900 bg-slate-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Geographic Location Selector */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
            <img src="/logo-icon.png" alt="Luvia Logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white leading-none font-heading">
                Luvia <span className="text-teal-400 text-xs">Cruz del Eje</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline leading-tight">
                Tu Salud, Unificada
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          {/* Location Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full border border-teal-800/60 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-teal-500 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Cambiar localidad de atención"
            >
              <MapPin className="size-3.5 text-teal-400" />
              <span>{selectedCity.name}, {selectedCity.province}</span>
              <ChevronDown className="size-3 text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-2xl border border-teal-800 bg-slate-800 p-1.5 shadow-2xl z-50">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seleccionar Localidad
                </div>
                <div className="mt-1 space-y-0.5">
                  {SUPPORTED_CITIES.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      disabled={!city.isAvailable}
                      onClick={() => {
                        if (city.isAvailable) {
                          onCityChange(city)
                          setIsCityDropdownOpen(false)
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition-colors ${
                        city.id === selectedCity.id
                          ? 'bg-teal-900/60 font-bold text-teal-300'
                          : city.isAvailable
                            ? 'text-slate-200 hover:bg-slate-700 cursor-pointer font-medium'
                            : 'text-slate-500 cursor-not-allowed bg-slate-800/40'
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {city.isAvailable ? 'Activo' : 'Próximamente'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick actions & Authentication */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewBooking}
            className="hidden sm:inline-flex cursor-pointer gap-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
          >
            <PlusCircle className="size-3.5 text-teal-400" />
            <span>Nuevo Turno</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLookupBooking}
            className="cursor-pointer gap-1.5 text-xs font-bold text-slate-200 border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-full"
          >
            <Search className="size-3.5 text-slate-400" />
            <span className="hidden md:inline">Consultar Cita</span>
          </Button>

          <Link
            to="/login"
            className="inline-flex items-center cursor-pointer gap-1.5 bg-teal-600 text-xs font-bold text-white hover:bg-teal-500 px-4 py-2 rounded-full shadow-md shadow-teal-600/20 transition"
          >
            <LogIn className="size-3.5" />
            <span>Ingresar</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
