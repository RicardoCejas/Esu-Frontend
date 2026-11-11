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
  excludePermissionCodes?: PermissionCode[];
}

export const PermisosMatrixSelector: React.FC<PermisosMatrixSelectorProps> = ({
  catalogo,
  selectedPermisos,
  onChange,
  rolBase = 'RECEPCIONISTA',
  disabled = false,
  excludePermissionCodes = [],
}) => {
  const excludedSet = useMemo(() => new Set(excludePermissionCodes), [excludePermissionCodes]);

  const modulos = useMemo(() => {
    const map = new Map<string, Permiso[]>();
    for (const p of catalogo) {
      if (excludedSet.has(p.codigo)) continue;
      const list = map.get(p.modulo) ?? [];
      list.push(p);
      map.set(p.modulo, list);
    }
    return Array.from(map.entries());
  }, [catalogo, excludedSet]);

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
    const preset = (DEFAULT_PERMISSIONS_BY_ROLE[rolBase] ?? []).filter(
      (code) => !excludedSet.has(code)
    );
    onChange(preset);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">
            Catálogo de Permisos Granulares ({selectedPermisos.length} asignados)
          </h3>
        </div>
        <button
          type="button"
          onClick={aplicarRecomendados}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          Aplicar recomendados para {rolBase}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {modulos.map(([modulo, permisos]) => {
          const allSelected = permisos.every((p) => selectedSet.has(p.codigo));
          return (
            <div key={modulo} className="rounded-lg border border-border bg-card p-3 shadow-xs">
              <div className="mb-2 flex items-center justify-between border-b border-border/70 pb-1.5">
                <span className="text-xs font-bold tracking-wider text-foreground uppercase">
                  {modulo.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => toggleModulo(permisos)}
                  disabled={disabled}
                  className="text-[11px] font-semibold text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-sm disabled:opacity-50 cursor-pointer"
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
                      className={`flex cursor-pointer items-start gap-2 rounded-md border p-1.5 transition-colors ${
                        isChecked
                          ? 'border-primary/40 bg-card'
                          : 'border-transparent hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermiso(p.codigo)}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-medium text-foreground">{p.nombre}</p>
                        {p.descripcion && <p className="truncate text-muted-foreground">{p.descripcion}</p>}
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
