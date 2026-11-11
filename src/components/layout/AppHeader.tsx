import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, LogIn, ChevronDown, UserCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher'
import type { UserRole } from '@/types'

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
  onNewBooking?: () => void
  onLookupBooking?: () => void
  onLoginClick?: () => void
}

function getDashboardPath(rol?: UserRole): string {
  switch (rol) {
    case 'MEDICO':
      return '/dashboard/medico'
    case 'RECEPCIONISTA':
      return '/dashboard/recepcion'
    case 'ADMIN':
      return '/dashboard/admin/sedes'
    case 'PACIENTE':
    default:
      return '/dashboard/paciente'
  }
}

export function AppHeader({
  selectedCity,
  onCityChange,
}: AppHeaderProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    localStorage.removeItem('esu_dev_mode')
    localStorage.removeItem('esu_dev_active_role')
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/70 bg-[#edf5fa]/95 backdrop-blur supports-[backdrop-filter]:bg-[#edf5fa]/80 text-slate-900 shadow-xs">
      <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Geographic Location Selector */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition shrink-0">
            <img src="/logo-icon.png" alt="Luvia Logo" className="h-8 sm:h-9 w-8 sm:w-9 object-contain drop-shadow-xs" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                Luvia <span className="text-sky-600 text-xs font-bold hidden xs:inline">Cruz del Eje</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline leading-tight mt-0.5">
                Tu Salud, Unificada
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-300 hidden sm:block" />

          {/* Location Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-sky-200/80 bg-white/90 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-700 hover:border-sky-400 hover:bg-sky-50 transition-colors cursor-pointer shadow-xs max-w-[130px] sm:max-w-none"
              title="Cambiar localidad de atención"
            >
              <MapPin className="size-3 sm:size-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{selectedCity.name}<span className="hidden sm:inline">, {selectedCity.province}</span></span>
              <ChevronDown className="size-2.5 sm:size-3 text-slate-500 shrink-0" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-2xl border border-sky-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
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
                          ? 'bg-sky-100 font-bold text-sky-800'
                          : city.isAvailable
                            ? 'text-slate-700 hover:bg-sky-50 cursor-pointer font-medium'
                            : 'text-slate-400 cursor-not-allowed bg-slate-50/60'
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

        {/* Right: Sesión activa y portal del usuario */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <DevRoleSwitcher />
              <NotificationCenter />

              <Link
                to={getDashboardPath(user.rol)}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-800 transition cursor-pointer"
              >
                <UserCheck className="size-3.5" />
                <span>Mi Portal</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 transition cursor-pointer"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center cursor-pointer gap-1.5 bg-sky-700 text-xs font-semibold text-white hover:bg-sky-800 px-4 py-2 rounded-full shadow-xs transition"
            >
              <LogIn className="size-3.5" />
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
