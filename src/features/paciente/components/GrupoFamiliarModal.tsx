import React, { useState } from 'react';
import {
  Users,
  X,
  UserPlus,
  Trash2,
  Fingerprint,
} from 'lucide-react';

export interface Familiar {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  vinculo: 'Hijo/a' | 'Cónyuge' | 'Padre/Madre' | 'Otro a cargo';
  obraSocial?: string;
  nroAfiliado?: string;
}

interface GrupoFamiliarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFamiliar?: (familiar: Familiar) => void;
}

export const GrupoFamiliarModal: React.FC<GrupoFamiliarModalProps> = ({
  isOpen,
  onClose,
  onSelectFamiliar,
}) => {
  const [familiares, setFamiliares] = useState<Familiar[]>(() => {
    const saved = localStorage.getItem('esu_grupo_familiar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'fam-1',
        nombre: 'Sofía',
        apellido: 'Cejas',
        dni: '52.114.920',
        fechaNacimiento: '2016-04-12',
        vinculo: 'Hijo/a',
        obraSocial: 'APROSS',
        nroAfiliado: '20-52114920-4/02',
      },
      {
        id: 'fam-2',
        nombre: 'Elena',
        apellido: 'Morales',
        dni: '14.882.301',
        fechaNacimiento: '1954-09-25',
        vinculo: 'Padre/Madre',
        obraSocial: 'PAMI',
        nroAfiliado: '15049382100',
      },
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevoVinculo, setNuevoVinculo] = useState<Familiar['vinculo']>('Hijo/a');
  const [nuevaObraSocial, setNuevaObraSocial] = useState('');
  const [nuevoNroAfiliado, setNuevoNroAfiliado] = useState('');

  if (!isOpen) return null;

  const handleGuardarFamiliar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoApellido || !nuevoDni) return;

    const nuevo: Familiar = {
      id: 'fam-' + Date.now(),
      nombre: nuevoNombre,
      apellido: nuevoApellido,
      dni: nuevoDni,
      fechaNacimiento: nuevaFecha || '2018-01-01',
      vinculo: nuevoVinculo,
      obraSocial: nuevaObraSocial || 'Particular',
      nroAfiliado: nuevoNroAfiliado || 'N/A',
    };

    const actualizados = [...familiares, nuevo];
    setFamiliares(actualizados);
    localStorage.setItem('esu_grupo_familiar', JSON.stringify(actualizados));

    setNuevoNombre('');
    setNuevoApellido('');
    setNuevoDni('');
    setNuevaFecha('');
    setNuevoVinculo('Hijo/a');
    setNuevaObraSocial('');
    setNuevoNroAfiliado('');
    setShowAddForm(false);
  };

  const handleEliminar = (id: string) => {
    const filtrados = familiares.filter((f) => f.id !== id);
    setFamiliares(filtrados);
    localStorage.setItem('esu_grupo_familiar', JSON.stringify(filtrados));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Mi Grupo Familiar</h3>
              <p className="text-xs text-muted-foreground">
                Hijos, cónyuge y adultos mayores a cargo (HU-FE-66)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {familiares.map((fam) => (
            <div
              key={fam.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3.5 hover:border-sky-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-sm">
                  {fam.nombre.charAt(0)}
                  {fam.apellido.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">
                      {fam.nombre} {fam.apellido}
                    </h4>
                    <span className="rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">
                      {fam.vinculo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Fingerprint className="h-3 w-3" /> {fam.dni}
                    </span>
                    <span>•</span>
                    <span>{fam.obraSocial || 'Particular'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSelectFamiliar && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFamiliar(fam);
                      onClose();
                    }}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer"
                  >
                    Turnar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEliminar(fam.id)}
                  title="Desvincular familiar"
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {familiares.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No tienes familiares vinculados a tu cuenta todavía.
            </div>
          )}
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleGuardarFamiliar}
            className="mt-5 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
                Vincular Nuevo Familiar
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Sofía"
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Apellido</label>
                <input
                  type="text"
                  required
                  value={nuevoApellido}
                  onChange={(e) => setNuevoApellido(e.target.value)}
                  placeholder="Ej. Cejas"
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">DNI</label>
                <input
                  type="text"
                  required
                  value={nuevoDni}
                  onChange={(e) => setNuevoDni(e.target.value)}
                  placeholder="Sin puntos"
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Vínculo</label>
                <select
                  value={nuevoVinculo}
                  onChange={(e) => setNuevoVinculo(e.target.value as Familiar['vinculo'])}
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                >
                  <option value="Hijo/a">Hijo/a</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Padre/Madre">Padre/Madre</option>
                  <option value="Otro a cargo">Otro a cargo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Obra Social</label>
                <input
                  type="text"
                  value={nuevaObraSocial}
                  onChange={(e) => setNuevaObraSocial(e.target.value)}
                  placeholder="APROSS, PAMI, etc."
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">N° de Afiliado</label>
                <input
                  type="text"
                  value={nuevoNroAfiliado}
                  onChange={(e) => setNuevoNroAfiliado(e.target.value)}
                  placeholder="Opcional"
                  className="w-full mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 py-2 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer"
            >
              Guardar Familiar Vinculado
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-500/50 p-2.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-500/5 transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Agregar Familiar a Cargo</span>
          </button>
        )}
      </div>
    </div>
  );
};
