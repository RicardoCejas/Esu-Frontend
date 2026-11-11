import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { pacientesService } from '@/api/pacientesService';
import { reportesService } from '@/api/reportesService';
import type { User } from '@/types';
import {
  Search,
  UserPlus,
  Phone,
  Lock,
  Eye,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';

const PACIENTES_POR_PAGINA = 10;

export const PadronPacientesPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isMedico = user?.rol === 'MEDICO';
  const canRegistrarPaciente = !isMedico && can('PACIENTES_REGISTRAR');
  const canManageTurnos = !isMedico && can('TURNOS_CREAR');

  const [pacientes, setPacientes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const handleExportarPadron = async () => {
    setIsExportingCsv(true);
    try {
      await reportesService.exportarPacientesCsv(user?.centroSaludId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al exportar el padrón de pacientes.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const cargarPacientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pacientesService.getAll();
      setPacientes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar el padrón de pacientes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    pacientesService
      .getAll()
      .then((data) => {
        if (isSubscribed) {
          setPacientes(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : 'Error al sincronizar el padrón de pacientes.';
          setError(msg);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return pacientes.filter((p) => {
      const matchTerm =
        !term ||
        (p.nombre ?? '').toLowerCase().includes(term) ||
        (p.apellido ?? '').toLowerCase().includes(term) ||
        (p.dni ?? '').includes(term) ||
        (p.email ?? '').toLowerCase().includes(term) ||
        (p.obraSocial ?? '').toLowerCase().includes(term);

      const matchEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'ACTIVOS' && p.activo !== false) ||
        (filtroEstado === 'INACTIVOS' && p.activo === false);

      return matchTerm && matchEstado;
    });
  }, [pacientes, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / PACIENTES_POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const pacientesPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * PACIENTES_POR_PAGINA;
    return pacientesFiltrados.slice(inicio, inicio + PACIENTES_POR_PAGINA);
  }, [pacientesFiltrados, paginaSegura]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Padrón Asistencial y Empadronamiento
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Filiación y cobertura médica para otorgamiento de turnos. Datos protegidos bajo Ley 25.326 y 26.529.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {can('REPORTES_VER') && (
            <button
              type="button"
              onClick={handleExportarPadron}
              disabled={isExportingCsv}
              title="Descargar padrón asistencial en formato CSV oficial"
              className="min-h-[40px] inline-flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-600 disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{isExportingCsv ? 'Exportando...' : 'Exportar CSV'}</span>
            </button>
          )}

          {canRegistrarPaciente && (
            <Link
              to="/dashboard/recepcion/pacientes/nuevo"
              className="min-h-[40px] inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>Registrar Nuevo Paciente</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-900 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void cargarPacientes()}
            className="underline font-bold text-rose-700 hover:text-rose-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Contenedor Unificado: Barra de Búsqueda + Filtro + Tabla */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Toolbar de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 border-b border-border bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              aria-label="Buscar por nombre, apellido, DNI, email u obra social"
              placeholder="Buscar por Nombre, DNI, email u obra social..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 border border-input rounded-lg px-2.5 py-1 bg-background text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                aria-label="Filtrar por estado del paciente"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as 'TODOS' | 'ACTIVOS' | 'INACTIVOS');
                  setPaginaActual(1);
                }}
                className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="ACTIVOS">Solo Activos</option>
                <option value="INACTIVOS">Solo Inactivos</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Users className="h-3.5 w-3.5" />
              <span className="tabular-nums">
                {pacientesFiltrados.length} {pacientesFiltrados.length === 1 ? 'paciente' : 'pacientes'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Médica Asistencial */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Listado de pacientes empadronados">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="p-3.5">DNI</th>
                <th scope="col" className="p-3.5">Paciente</th>
                <th scope="col" className="p-3.5">Contacto</th>
                <th scope="col" className="p-3.5">Cobertura</th>
                <th scope="col" className="p-3.5 text-center">Estado</th>
                <th scope="col" className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Cargando padrón asistencial...</span>
                    </div>
                  </td>
                </tr>
              ) : pacientesPaginados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                pacientesPaginados.map((pac) => (
                  <tr key={pac.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 tabular-nums font-bold text-foreground">{pac.dni}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">
                        {pac.nombre} {pac.apellido}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{pac.email || 'Sin correo registrado'}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <div className="flex items-center gap-1 tabular-nums text-[11px]">
                        <Phone className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                        <span>{pac.telefono || 'Sin teléfono'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-foreground">{pac.obraSocial || 'Particular'}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs ${
                          pac.activo !== false ? 'bg-emerald-700' : 'bg-slate-600'
                        }`}
                      >
                        {pac.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          to={`/dashboard/recepcion/pacientes/${pac.id}`}
                          aria-label={`Ver ficha de ${pac.nombre} ${pac.apellido}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                          <span>Ver Ficha</span>
                        </Link>
                        {canManageTurnos && pac.activo !== false && (
                          <Link
                            to={`/dashboard/recepcion/turnos/nuevo?dni=${encodeURIComponent(pac.dni)}`}
                            className="inline-flex items-center rounded-lg bg-sky-700 hover:bg-sky-800 px-2.5 py-1 text-xs font-semibold text-white transition"
                          >
                            Dar Turno
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-border bg-muted/10 text-xs">
            <span className="text-muted-foreground font-medium">
              Página {paginaActual} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual <= 1}
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                className="p-1 rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-40 transition cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                className="p-1 rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-40 transition cursor-pointer"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
