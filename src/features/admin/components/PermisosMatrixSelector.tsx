import React, { useMemo } from 'react';
import type { Permiso, PermissionCode } from '@/types';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/types';
import { ShieldCheck, RotateCcw } from 'lucide-react';

export { DEFAULT_PERMISSIONS_BY_ROLE };

export interface PermisosMatrixSelectorProps {
  catalogo: Permiso[];
  selectedPermisos: PermissionCode[];
  onChange: (permisos: PermissionCode[]) => void;
  rolBase?: string;
  disabled?: boolean;
}

export const PermisosMatrixSelector: React.FC<PermisosMatrixSelectorProps> = ({
  catalogo,
  selectedPermisos,
  onChange,
  rolBase = 'RECEPCIONISTA',
  disabled = false,
}) => {
  const modulos = useMemo(() => {
    const map = new Map<string, Permiso[]>();
    for (const p of catalogo) {
      const list = map.get(p.modulo) ?? [];
      list.push(p);
      map.set(p.modulo, list);
    }
    return Array.from(map.entries());
  }, [catalogo]);

  const selectedSet = useMemo(() => new Set(selectedPermisos), [selectedPermisos]);

  const togglePermiso = (codigo: PermissionCode) => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (next.has(codigo)) next.delete(codigo);
    else next.add(codigo);
    onChange(Array.from(next));
  };

  const toggleModulo = (moduloPermisos: Permiso[]) => {
    if (disabled) return;
    const allSelected = moduloPermisos.every((p) => selectedSet.has(p.codigo));
    const next = new Set(selectedSet);
    if (allSelected) {
      moduloPermisos.forEach((p) => next.delete(p.codigo));
    } else {
      moduloPermisos.forEach((p) => next.add(p.codigo));
    }
    onChange(Array.from(next));
  };

  const aplicarRecomendados = () => {
    const preset = DEFAULT_PERMISSIONS_BY_ROLE[rolBase] ?? [];
    onChange(preset);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-700" />
          <h3 className="text-sm font-semibold text-slate-900">
            Catálogo de Permisos Granulares ({selectedPermisos.length} asignados)
          </h3>
        </div>
        <button
          type="button"
          onClick={aplicarRecomendados}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-600 disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          Aplicar recomendados para {rolBase}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {modulos.map(([modulo, permisos]) => {
          const allSelected = permisos.every((p) => selectedSet.has(p.codigo));
          return (
            <div key={modulo} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                  {modulo.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => toggleModulo(permisos)}
                  disabled={disabled}
                  className="text-[11px] font-medium text-sky-700 hover:underline disabled:opacity-50"
                >
                  {allSelected ? 'Desmarcar módulo' : 'Marcar módulo'}
                </button>
              </div>
              <div className="space-y-1.5">
                {permisos.map((p) => {
                  const isChecked = selectedSet.has(p.codigo);
                  return (
                    <label
                      key={p.codigo}
                      className={`flex cursor-pointer items-start gap-2 rounded-md p-1.5 transition-colors ${
                        isChecked ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermiso(p.codigo)}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-medium text-slate-900">{p.nombre}</p>
                        {p.descripcion && <p className="truncate text-slate-500">{p.descripcion}</p>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
