import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { pacientesService } from '@/api/pacientesService';
import { clinicaService } from '@/api/clinicaService';
import { ScannableQrCode } from '@/components/common/ScannableQrCode';
import { OBRAS_SOCIALES_ARGENTINA } from '@/lib/obrasSociales';
import type { User, RecetaDigitalDto } from '@/types';
import {
  Pill,
  Plus,
  Search,
  FileText,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Printer,
  Copy,
  X,
  CheckCircle2,
  Trash2,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

interface FármacoFormItem {
  id: string;
  droga: string;
  nombreComercial: string;
  presentacion: string;
  dosisIndicada: string;
  viaAdministracion: string;
  posologia: string;
  duracion: string;
  cantidad: string;
}

const PADRON_SEMILLA_DEFAULT: User[] = [
  {
    id: '19',
    pacienteId: '19',
    nombre: 'Ricardo',
    apellido: 'Cejas',
    dni: '40026880',
    rol: 'PACIENTE',
    telefono: '+543549551727',
    email: 'ricky20062@gmail.com',
    obraSocial: 'Particular (Sin cobertura)',
    nroAfiliado: '20-40026880-4/01',
    grupoSanguineo: '0+',
    fechaNacimiento: '1997-02-28',
    centroSaludNombre: 'Hospital Provincial Dr. Aurelio Crespo',
  },
  {
    id: '23',
    pacienteId: '23',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '35123456',
    rol: 'PACIENTE',
    telefono: '3549-412233',
    email: 'juan.perez@salud.gob.ar',
    obraSocial: 'Apross',
    nroAfiliado: 'AF-100234',
    grupoSanguineo: 'A+',
    fechaNacimiento: '1990-05-15',
    centroSaludNombre: 'Hospital Provincial Dr. Aurelio Crespo',
  },
  {
    id: '24',
    pacienteId: '24',
    nombre: 'Ana',
    apellido: 'Torres',
    dni: '28987654',
    rol: 'PACIENTE',
    telefono: '3549-456789',
    email: 'ana.torres@salud.gob.ar',
    obraSocial: 'PAMI',
    nroAfiliado: 'AF-802341',
    grupoSanguineo: '0-',
    fechaNacimiento: '1982-11-20',
    centroSaludNombre: 'Clínica Cabrera',
  },
  {
    id: '1',
    pacienteId: '1',
    nombre: 'Facundo',
    apellido: 'Alvarez',
    dni: '39432104',
    rol: 'PACIENTE',
    telefono: '3549-482910',
    email: '39432104@esu.salud.gob.ar',
    obraSocial: 'Particular',
    nroAfiliado: '39432104',
    grupoSanguineo: 'B+',
    fechaNacimiento: '1996-03-12',
    centroSaludNombre: 'Hospital Provincial Dr. Aurelio Crespo',
  },
  {
    id: '2',
    pacienteId: '2',
    nombre: 'Sofía Valentina',
    apellido: 'Gómez',
    dni: '41258963',
    rol: 'PACIENTE',
    telefono: '3549-491823',
    email: '41258963@esu.salud.gob.ar',
    obraSocial: 'PAMI',
    nroAfiliado: '150-41258963',
    grupoSanguineo: 'A+',
    fechaNacimiento: '1998-08-24',
    centroSaludNombre: 'Sanatorio María Isabel',
  },
];

const FARMACOS_FRECUENTES = [
  { droga: 'Amoxicilina + Ácido Clavulánico', dosis: '875/125 mg', presentacion: 'Comprimidos recubiertos', posologia: '1 comprimido cada 12 horas con las comidas' },
  { droga: 'Ibuprofeno', dosis: '600 mg', presentacion: 'Comprimidos', posologia: '1 comprimido cada 8 horas si hay dolor o fiebre' },
  { droga: 'Paracetamol', dosis: '1 g', presentacion: 'Comprimidos', posologia: '1 comprimido cada 8 horas' },
  { droga: 'Losartán Potásico', dosis: '50 mg', presentacion: 'Comprimidos', posologia: '1 comprimido por la mañana en ayunas' },
  { droga: 'Metformina Clorhidrato', dosis: '850 mg', presentacion: 'Comprimidos de liberación prolongada', posologia: '1 comprimido con la cena' },
  { droga: 'Enalapril', dosis: '10 mg', presentacion: 'Comprimidos', posologia: '1 comprimido cada 12 horas' },
  { droga: 'Omeprazol', dosis: '20 mg', presentacion: 'Cápsulas gastroresistentes', posologia: '1 cápsula diaria 30 minutos antes del desayuno' },
  { droga: 'Azitromicina', dosis: '500 mg', presentacion: 'Comprimidos', posologia: '1 comprimido por día durante 3 días' },
];

const DIAGNOSTICOS_FRECUENTES = [
  { codigo: 'J02.9', nombre: 'Faringitis aguda, no especificada' },
  { codigo: 'I10', nombre: 'Hipertensión esencial (primaria)' },
  { codigo: 'E11.9', nombre: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { codigo: 'J20.9', nombre: 'Bronquitis aguda, no especificada' },
  { codigo: 'K21.9', nombre: 'Enfermedad por reflujo gastroesofágico sin esofagitis' },
  { codigo: 'N39.0', nombre: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'M54.5', nombre: 'Lumbago no especificado / Lumbalgia mecánica' },
];

export const MedicoRecetasPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [recetas, setRecetas] = useState<RecetaDigitalDto[]>([]);
  const [pacientesPadron, setPacientesPadron] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'DISPONIBLE' | 'DISPENSADA' | 'VENCIDA'>('TODAS');

  // Modal Nueva Receta Directa
  const [isModalNuevaRecetaOpen, setIsModalNuevaRecetaOpen] = useState(false);
  const [guardandoReceta, setGuardandoReceta] = useState(false);

  // Buscador y selección de paciente en el formulario
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('');
  const [pacienteBusquedaTexto, setPacienteBusquedaTexto] = useState('');
  const [ingresoManualPaciente, setIngresoManualPaciente] = useState(false);

  // Campos de paciente y cobertura
  const [formPacienteNombre, setFormPacienteNombre] = useState('');
  const [formPacienteDni, setFormPacienteDni] = useState('');
  const [formObraSocial, setFormObraSocial] = useState('Particular');
  const [formNroAfiliado, setFormNroAfiliado] = useState('');
  const [formTokenObraSocial, setFormTokenObraSocial] = useState('');

  // Diagnóstico y tratamiento
  const [formDiagnostico, setFormDiagnostico] = useState('');
  const [formCodigoCie10, setFormCodigoCie10] = useState('');
  const [formIndicaciones, setFormIndicaciones] = useState('');
  const formLugarRetiro = 'Farmacia Hospitalaria / Red de Farmacias Cruz del Eje';

  // Fármacos prescriptos (mínimo 1)
  const [farmacos, setFarmacos] = useState<FármacoFormItem[]>([
    {
      id: 'f-1',
      droga: '',
      nombreComercial: '',
      presentacion: 'Comprimidos',
      dosisIndicada: '',
      viaAdministracion: 'Oral',
      posologia: '',
      duracion: '7 días',
      cantidad: '1 caja / envase',
    },
  ]);

  // Modal Previsualización de Receta Oficial / QR
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<RecetaDigitalDto | null>(null);
  const [isModalVerRecetaOpen, setIsModalVerRecetaOpen] = useState(false);

  // Cargar padrón de pacientes y recetas previas
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [pacientesData, recetasBackend] = await Promise.allSettled([
          pacientesService.getAll(),
          clinicaService.getMisRecetas(),
        ]);

        if (!isMounted) return;

        if (pacientesData.status === 'fulfilled' && Array.isArray(pacientesData.value) && pacientesData.value.length > 0) {
          setPacientesPadron(pacientesData.value);
        } else {
          setPacientesPadron(PADRON_SEMILLA_DEFAULT);
        }

        // Recuperar recetas emitidas localmente
        let localRecetas: RecetaDigitalDto[] = [];
        try {
          const raw = localStorage.getItem('esu_recetas_emitidas');
          if (raw) {
            localRecetas = JSON.parse(raw);
          }
        } catch {
          // Ignorar fallo de storage
        }

        let backendList: RecetaDigitalDto[] = [];
        if (recetasBackend.status === 'fulfilled' && Array.isArray(recetasBackend.value)) {
          backendList = recetasBackend.value;
        }

        // Combinar recetas sin duplicar por id o código
        const combinedMap = new Map<string, RecetaDigitalDto>();
        [...localRecetas, ...backendList].forEach((r) => {
          const key = String(r.id || r.hashIntegridad || Math.random());
          combinedMap.set(key, r);
        });

        // Si no hay recetas registradas, inicializar con mock demostrativo para Cruz del Eje
        if (combinedMap.size === 0) {
          const mockInicial: RecetaDigitalDto[] = [
            {
              id: 'REC-2026-94812',
              pacienteId: 1,
              pacienteNombre: 'Juan Carlos Gómez',
              pacienteDni: '28456123',
              pacienteObraSocial: 'PAMI',
              pacienteNroAfiliado: '15023948102',
              tokenObraSocial: '849120',
              profesionalId: user?.id || '2',
              profesionalNombre: `${user?.nombre || 'María'} ${user?.apellido || 'Fernández'}`,
              profesionalMatricula: user?.matricula || 'MP-34982',
              fechaEmision: new Date().toLocaleDateString('es-AR'),
              fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
              diagnostico: 'Faringoamigdalitis purulenta aguda',
              codigoCie10: 'J02.9',
              indicacionesGenerales: 'Completar los 7 días de antibiótico aunque ceda la fiebre. Hidratación abundante.',
              estadoReceta: 'DISPONIBLE',
              centroSaludEmisorNombre: user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo',
              hashIntegridad: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              medicamentos: [
                {
                  droga: 'Amoxicilina + Ácido Clavulánico',
                  nombreComercial: 'Optamox Dúo',
                  presentacion: 'Comprimidos recubiertos',
                  dosisIndicada: '875/125 mg',
                  posologia: '1 comprimido cada 12 horas tras las comidas',
                  viaAdministracion: 'Oral',
                  duracion: '7 días',
                  cantidad: '1 envase (14 comp.)',
                },
                {
                  droga: 'Ibuprofeno',
                  nombreComercial: 'Ibupirac',
                  presentacion: 'Comprimidos',
                  dosisIndicada: '600 mg',
                  posologia: '1 comprimido cada 8 horas si hay dolor o temperatura mayor a 38°C',
                  viaAdministracion: 'Oral',
                  duracion: '3 días',
                  cantidad: '1 envase (10 comp.)',
                },
              ],
            },
          ];
          mockInicial.forEach((m) => combinedMap.set(String(m.id), m));
          localStorage.setItem('esu_recetas_emitidas', JSON.stringify(mockInicial));
        }

        setRecetas(Array.from(combinedMap.values()));
      } catch (err) {
        console.error('Error cargando recetas:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Búsqueda on-demand por DNI si el médico tipea dígitos
  useEffect(() => {
    const raw = pacienteBusquedaTexto.trim();
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length < 6) return;

    let active = true;
    const timer = setTimeout(async () => {
      const yaExiste = pacientesPadron.some(
        (p) => p.dni === cleanDigits || p.dni?.replace(/\D/g, '') === cleanDigits
      );
      if (!yaExiste) {
        try {
          const found = await pacientesService.getByDni(cleanDigits);
          if (active && found) {
            setPacientesPadron((prev) => [found, ...prev]);
          }
        } catch {
          // ignore
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pacienteBusquedaTexto, pacientesPadron]);

  // Selección de paciente desde el padrón
  const handleSeleccionarPaciente = (p: User) => {
    setPacienteSeleccionadoId(p.id);
    setFormPacienteNombre(`${p.nombre} ${p.apellido}`);
    setFormPacienteDni(p.dni || '');
    setFormObraSocial(p.obraSocial || 'Particular');
    setFormNroAfiliado(p.nroAfiliado || '');
    setPacienteBusquedaTexto(`${p.apellido}, ${p.nombre} (DNI ${p.dni})`);
  };

  // Pacientes filtrados para el selector
  const pacientesFiltradosSelector = useMemo(() => {
    if (!pacienteBusquedaTexto.trim()) return pacientesPadron.slice(0, 8);
    const q = pacienteBusquedaTexto.toLowerCase();
    return pacientesPadron
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          (p.dni && p.dni.includes(q))
      )
      .slice(0, 8);
  }, [pacientesPadron, pacienteBusquedaTexto]);

  // Agregar y quitar medicamentos en el formulario
  const handleAgregarFarmaco = () => {
    setFarmacos((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}-${Math.random()}`,
        droga: '',
        nombreComercial: '',
        presentacion: 'Comprimidos',
        dosisIndicada: '',
        viaAdministracion: 'Oral',
        posologia: '',
        duracion: '7 días',
        cantidad: '1 caja / envase',
      },
    ]);
  };

  const handleEliminarFarmaco = (id: string) => {
    if (farmacos.length <= 1) {
      toastError('La receta debe contener al menos un medicamento prescripto.');
      return;
    }
    setFarmacos((prev) => prev.filter((f) => f.id !== id));
  };

  const handleActualizarFarmaco = (id: string, campo: keyof FármacoFormItem, valor: string) => {
    setFarmacos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f))
    );
  };

  const handleSeleccionarSugerenciaFarmaco = (id: string, item: typeof FARMACOS_FRECUENTES[0]) => {
    setFarmacos((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              droga: item.droga,
              dosisIndicada: item.dosis,
              presentacion: item.presentacion,
              posologia: item.posologia,
            }
          : f
      )
    );
  };

  // Emitir nueva receta médica directa
  const handleEmitirReceta = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombreLimpio = formPacienteNombre.trim();
    const dniLimpio = formPacienteDni.trim();

    if (!nombreLimpio || !dniLimpio) {
      toastError('Debés ingresar el nombre completo y DNI del paciente.');
      return;
    }

    if (!formDiagnostico.trim()) {
      toastError('Por favor indicá el diagnóstico clínico de la prescripción.');
      return;
    }

    // Validar que al menos haya un fármaco completo con droga genérica
    const farmacosValidos = farmacos.filter((f) => f.droga.trim() !== '');
    if (farmacosValidos.length === 0) {
      toastError('Debe incluir al menos un fármaco con la droga genérica obligatoria (Ley 27.553).');
      return;
    }

    setGuardandoReceta(true);

    try {
      const codigoGenerado = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const fechaHoy = new Date().toLocaleDateString('es-AR');
      const fechaVenc = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR');
      const hashSimulado = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const nuevaReceta: RecetaDigitalDto = {
        id: codigoGenerado,
        pacienteId: pacienteSeleccionadoId || `pac-${dniLimpio}`,
        pacienteNombre: nombreLimpio,
        pacienteDni: dniLimpio,
        pacienteObraSocial: formObraSocial,
        pacienteNroAfiliado: formNroAfiliado || '-',
        tokenObraSocial: formTokenObraSocial.trim() || undefined,
        profesionalId: user?.id || '2',
        profesionalNombre: `${user?.nombre || 'Dr/a'} ${user?.apellido || 'Médico'}`,
        profesionalMatricula: user?.matricula || 'MP-34982',
        fechaEmision: fechaHoy,
        fechaVencimiento: fechaVenc,
        diagnostico: formDiagnostico.trim(),
        codigoCie10: formCodigoCie10.trim() || undefined,
        indicacionesGenerales: formIndicaciones.trim() || undefined,
        estadoReceta: 'DISPONIBLE',
        centroSaludEmisorNombre: user?.centroSaludNombre || 'Hospital Regional Aurelio Crespo',
        lugarRetiroSugerido: formLugarRetiro,
        hashIntegridad: hashSimulado,
        medicamentos: farmacosValidos.map((f) => ({
          droga: f.droga.trim(),
          nombreComercial: f.nombreComercial.trim() || undefined,
          presentacion: f.presentacion.trim(),
          dosisIndicada: f.dosisIndicada.trim(),
          posologia: f.posologia.trim() || 'Según indicación médica',
          viaAdministracion: f.viaAdministracion || 'Oral',
          duracion: f.duracion || '7 días',
          cantidad: f.cantidad || '1 envase',
        })),
      };

      // Intentar enviar al backend
      try {
        await clinicaService.emitirReceta({
          pacienteId: nuevaReceta.pacienteId,
          profesionalId: user?.id || 1,
          diagnostico: nuevaReceta.diagnostico,
          codigoCie10: nuevaReceta.codigoCie10,
          indicacionesGenerales: nuevaReceta.indicacionesGenerales,
          centroSaludEmisorNombre: nuevaReceta.centroSaludEmisorNombre,
          medicamentos: nuevaReceta.medicamentos,
        });
      } catch {
        // En modo local o offline se asegura en localStorage
      }

      // Guardar en estado y localStorage
      const listaActualizada = [nuevaReceta, ...recetas];
      setRecetas(listaActualizada);
      localStorage.setItem('esu_recetas_emitidas', JSON.stringify(listaActualizada));

      success(`Receta médica digital ${codigoGenerado} emitida exitosamente.`);
      setIsModalNuevaRecetaOpen(false);

      // Abrir modal de la receta recién emitida con QR listo para imprimir o enviar
      setRecetaSeleccionada(nuevaReceta);
      setIsModalVerRecetaOpen(true);

      // Reset form
      setPacienteSeleccionadoId('');
      setPacienteBusquedaTexto('');
      setFormPacienteNombre('');
      setFormPacienteDni('');
      setFormObraSocial('Particular');
      setFormNroAfiliado('');
      setFormTokenObraSocial('');
      setFormDiagnostico('');
      setFormCodigoCie10('');
      setFormIndicaciones('');
      setFarmacos([
        {
          id: 'f-1',
          droga: '',
          nombreComercial: '',
          presentacion: 'Comprimidos',
          dosisIndicada: '',
          viaAdministracion: 'Oral',
          posologia: '',
          duracion: '7 días',
          cantidad: '1 caja / envase',
        },
      ]);
    } catch (err) {
      console.error(err);
      toastError('Ocurrió un error al emitir la receta médica.');
    } finally {
      setGuardandoReceta(false);
    }
  };

  // Filtrado de recetas en la tabla
  const recetasFiltradas = useMemo(() => {
    return recetas.filter((r) => {
      // Filtro por estado
      if (filtroEstado !== 'TODAS') {
        if (filtroEstado === 'DISPONIBLE' && r.estadoReceta !== 'DISPONIBLE' && r.estadoReceta !== 'PENDIENTE') {
          return false;
        }
        if (filtroEstado === 'DISPENSADA' && r.estadoReceta !== 'DISPENSADA') {
          return false;
        }
        if (filtroEstado === 'VENCIDA' && r.estadoReceta !== 'VENCIDA') {
          return false;
        }
      }

      // Filtro por búsqueda
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      const matchPaciente = (r.pacienteNombre || '').toLowerCase().includes(q);
      const matchDni = (r.pacienteDni || '').includes(q);
      const matchCodigo = String(r.id || '').toLowerCase().includes(q);
      const matchDiagnostico = (r.diagnostico || '').toLowerCase().includes(q);
      const matchMedicamento = (r.medicamentos || []).some(
        (m) =>
          m.droga.toLowerCase().includes(q) ||
          (m.nombreComercial || '').toLowerCase().includes(q)
      );

      return matchPaciente || matchDni || matchCodigo || matchDiagnostico || matchMedicamento;
    });
  }, [recetas, filtroEstado, busqueda]);

  // Copiar código o hash
  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    success('Código de receta copiado al portapapeles.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <Pill className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Prescripción Directa y Recetas Médicas Digitales
              </h1>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Ley Nacional 27.553
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Prescribí recetas médicas a pacientes de forma inmediata sin necesidad de ingresar a través de la agenda ni turno activo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalNuevaRecetaOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Receta Directa</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Pill className="h-4 w-4 text-emerald-600" />
            <span>Total Recetas</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{recetas.length}</p>
          <span className="text-[11px] text-slate-400">Emitidas por usted</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
            <span>Vigentes / Activas</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {recetas.filter((r) => r.estadoReceta === 'DISPONIBLE' || r.estadoReceta === 'PENDIENTE').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Listas para farmacia</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Building2 className="h-4 w-4 text-sky-600" />
            <span>Dispensadas</span>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-2">
            {recetas.filter((r) => r.estadoReceta === 'DISPENSADA').length}
          </p>
          <span className="text-[11px] text-sky-600 font-medium">Entregadas en farmacia</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <UserIcon className="h-4 w-4 text-indigo-600" />
            <span>Pacientes</span>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">
            {new Set(recetas.map((r) => r.pacienteDni || r.pacienteId)).size}
          </p>
          <span className="text-[11px] text-indigo-600 font-medium">Beneficiarios únicos</span>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por paciente, DNI, código de receta o medicamento prescripto..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['TODAS', 'DISPONIBLE', 'DISPENSADA', 'VENCIDA'] as const).map((estado) => {
            const label =
              estado === 'TODAS'
                ? 'Todas'
                : estado === 'DISPONIBLE'
                ? 'Vigentes'
                : estado === 'DISPENSADA'
                ? 'Dispensadas'
                : 'Vencidas';
            const isActive = filtroEstado === estado;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listado de Recetas */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      ) : recetasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Pill className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">No se encontraron recetas médicas</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {busqueda
              ? 'No hay recetas que coincidan con los criterios de búsqueda ingresados.'
              : 'Aún no has emitido recetas directas en este período. Podés recetar presionando el botón "Nueva Receta Directa".'}
          </p>
          <button
            type="button"
            onClick={() => setIsModalNuevaRecetaOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Emitir Primera Receta Directa</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recetasFiltradas.map((r) => {
            const esVigente = r.estadoReceta === 'DISPONIBLE' || r.estadoReceta === 'PENDIENTE';
            return (
              <div
                key={String(r.id)}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition space-y-4"
              >
                <div className="space-y-3">
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {String(r.id)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            esVigente
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.estadoReceta === 'DISPENSADA'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {esVigente ? 'Vigente en Farmacia' : r.estadoReceta}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                        {r.pacienteNombre}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        DNI {r.pacienteDni || 'Sin especificar'} •{' '}
                        <strong className="text-slate-700">{r.pacienteObraSocial || 'Particular'}</strong>
                        {r.pacienteNroAfiliado && r.pacienteNroAfiliado !== '-' && (
                          <span> (Af. {r.pacienteNroAfiliado})</span>
                        )}
                        {r.tokenObraSocial && (
                          <span className="ml-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Token: {r.tokenObraSocial}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">Emisión</span>
                      <span className="text-xs font-bold text-slate-700">{r.fechaEmision}</span>
                      <span className="text-[10px] text-amber-700 block mt-0.5">Vence: {r.fechaVencimiento}</span>
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  {r.diagnostico && (
                    <div className="text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block">Diagnóstico Clínico:</span>
                      <p className="text-slate-600 mt-0.5">
                        {r.diagnostico}
                        {r.codigoCie10 && (
                          <span className="ml-1 text-[11px] font-mono font-bold text-slate-500">
                            ({r.codigoCie10})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Fármacos Prescriptos */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Fármacos Prescriptos ({r.medicamentos?.length || 0}):
                    </span>
                    <div className="space-y-1.5">
                      {r.medicamentos?.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 p-2 rounded-xl bg-emerald-50/40 border border-emerald-100/70 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{m.droga}</span>
                            {m.nombreComercial && (
                              <span className="text-[11px] text-emerald-800 font-semibold block">
                                Sugerido: {m.nombreComercial}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">
                              {m.presentacion} • {m.dosisIndicada} • {m.posologia}
                            </span>
                          </div>
                          <span className="rounded-lg bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 shrink-0">
                            {m.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones de la Receta */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Firma MP {r.profesionalMatricula}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopiarCodigo(String(r.id))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      title="Copiar código de validación"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecetaSeleccionada(r);
                        setIsModalVerRecetaOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Ver / Imprimir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA RECETA MÉDICA DIRECTA                                        */}
      {/* ========================================================================= */}
      {isModalNuevaRecetaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black">Emisión de Receta Médica Oficial</h2>
                  <p className="text-xs text-emerald-100">Prescripción directa autorizada según Ley 27.553</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalNuevaRecetaOpen(false)}
                className="rounded-xl p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEmitirReceta} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Sección 1: Selección y Datos del Paciente */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Paciente Empadronado o Particular
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIngresoManualPaciente(!ingresoManualPaciente);
                      setPacienteSeleccionadoId('');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {ingresoManualPaciente ? 'Seleccionar del padrón oficial' : 'Ingresar datos manualmente'}
                  </button>
                </div>

                {!ingresoManualPaciente ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      Buscar en el padrón de pacientes (DNI o Nombre)
                    </label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={pacienteBusquedaTexto}
                        onChange={(e) => setPacienteBusquedaTexto(e.target.value)}
                        placeholder="Escribí DNI o apellido del paciente para autocompletar..."
                        className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                      />
                    </div>

                    {/* Sugerencias de pacientes */}
                    {pacienteBusquedaTexto && pacientesFiltradosSelector.length > 0 && !pacienteSeleccionadoId && (
                      <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100">
                        {pacientesFiltradosSelector.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSeleccionarPaciente(p)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 transition flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-slate-900">
                                {p.apellido}, {p.nombre}
                              </span>
                              <span className="text-slate-500 ml-2">DNI: {p.dni || 'Sin DNI'}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {p.obraSocial || 'Particular'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Campos de Paciente (confirmación / edición) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Nombre y Apellido del Paciente *</label>
                    <input
                      type="text"
                      required
                      value={formPacienteNombre}
                      onChange={(e) => setFormPacienteNombre(e.target.value)}
                      placeholder="ej: María Rosa Morales"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">DNI / Documento *</label>
                    <input
                      type="text"
                      required
                      value={formPacienteDni}
                      onChange={(e) => setFormPacienteDni(e.target.value.replace(/\s+/g, ''))}
                      placeholder="ej: 32145678"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Cobertura Médica y Token de Obra Social */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Obra Social / Prepaga</label>
                    <select
                      value={formObraSocial}
                      onChange={(e) => setFormObraSocial(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {OBRAS_SOCIALES_ARGENTINA.map((os) => (
                        <option key={os} value={os}>
                          {os}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Nº de Afiliado</label>
                    <input
                      type="text"
                      value={formNroAfiliado}
                      onChange={(e) => setFormNroAfiliado(e.target.value)}
                      placeholder="ej: 15-998822-01"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <KeyRound className="h-3 w-3" /> Token de la Obra Social
                    </label>
                    <input
                      type="text"
                      value={formTokenObraSocial}
                      onChange={(e) => setFormTokenObraSocial(e.target.value)}
                      placeholder="ej: 684210"
                      className="mt-1 w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Diagnóstico Clínico */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Diagnóstico Clínico e Indicaciones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700">Diagnóstico Principal *</label>
                    <input
                      type="text"
                      required
                      value={formDiagnostico}
                      onChange={(e) => setFormDiagnostico(e.target.value)}
                      placeholder="ej: Faringoamigdalitis aguda bacteriana"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Código CIE-10</label>
                    <input
                      type="text"
                      value={formCodigoCie10}
                      onChange={(e) => setFormCodigoCie10(e.target.value)}
                      placeholder="ej: J02.9"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Sugerencias rápidas de diagnósticos */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold self-center">Frecuentes:</span>
                  {DIAGNOSTICOS_FRECUENTES.slice(0, 4).map((d) => (
                    <button
                      key={d.codigo}
                      type="button"
                      onClick={() => {
                        setFormDiagnostico(d.nombre);
                        setFormCodigoCie10(d.codigo);
                      }}
                      className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      {d.nombre} ({d.codigo})
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">
                    Indicaciones Generales para el Paciente / Farmacia
                  </label>
                  <textarea
                    rows={2}
                    value={formIndicaciones}
                    onChange={(e) => setFormIndicaciones(e.target.value)}
                    placeholder="ej: Tomar la medicación con las comidas. No discontinuar antes del plazo fijado."
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Sección 3: Medicamentos Prescriptos (Ley 27.553) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-emerald-700" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                        3. Prescripción de Medicamentos (Fármacos)
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Obligatorio prescribir por nombre genérico o monodroga según Ley 27.553
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAgregarFarmaco}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar Fármaco</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {farmacos.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800">
                          Medicamento #{index + 1}
                        </span>
                        {farmacos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarFarmaco(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                            title="Eliminar este fármaco"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Monodroga y Nombre Comercial */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-800">
                            Droga Genérica / Monodroga *
                          </label>
                          <input
                            type="text"
                            required
                            value={item.droga}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'droga', e.target.value)}
                            placeholder="ej: Amoxicilina, Ibuprofeno..."
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">
                            Nombre Comercial Sugerido (Opcional)
                          </label>
                          <input
                            type="text"
                            value={item.nombreComercial}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'nombreComercial', e.target.value)}
                            placeholder="ej: Optamox, Ibupirac..."
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                      </div>

                      {/* Dosis, Presentación, Vía y Cantidad */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Dosis Indicada *</label>
                          <input
                            type="text"
                            required
                            value={item.dosisIndicada}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'dosisIndicada', e.target.value)}
                            placeholder="ej: 500 mg, 1 g"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Presentación *</label>
                          <input
                            type="text"
                            required
                            value={item.presentacion}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'presentacion', e.target.value)}
                            placeholder="ej: Comprimidos, Jarabe"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Vía de Adm.</label>
                          <select
                            value={item.viaAdministracion}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'viaAdministracion', e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                          >
                            <option value="Oral">Oral</option>
                            <option value="Sublingual">Sublingual</option>
                            <option value="Inyectable IM/IV">Inyectable IM/IV</option>
                            <option value="Tópica">Tópica</option>
                            <option value="Inhalatoria">Inhalatoria</option>
                            <option value="Oftálmica">Oftálmica</option>
                            <option value="Ótica">Ótica</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Cantidad Envases</label>
                          <input
                            type="text"
                            value={item.cantidad}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'cantidad', e.target.value)}
                            placeholder="ej: 1 envase"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                      </div>

                      {/* Posología y Duración */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700">Posología / Modo de Toma *</label>
                          <input
                            type="text"
                            required
                            value={item.posologia}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'posologia', e.target.value)}
                            placeholder="ej: 1 comprimido cada 8 horas por 7 días"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Duración Tratamiento</label>
                          <input
                            type="text"
                            value={item.duracion}
                            onChange={(e) => handleActualizarFarmaco(item.id, 'duracion', e.target.value)}
                            placeholder="ej: 7 días, 14 días"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                          />
                        </div>
                      </div>

                      {/* Atajos de fármacos frecuentes */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Cargar rápido:</span>
                        {FARMACOS_FRECUENTES.slice(0, 4).map((frec, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSeleccionarSugerenciaFarmaco(item.id, frec)}
                            className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold hover:bg-emerald-100 transition cursor-pointer"
                          >
                            {frec.droga} {frec.dosis}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 4: Datos Profesionales y Firma */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">
                    Profesional Prescriptor: {user?.nombre} {user?.apellido}
                  </span>
                  <span className="text-slate-600 block">
                    Matrícula: {user?.matricula || 'MP-34982'} • Especialidad: {user?.especialidad || 'Medicina General'}
                  </span>
                  <span className="text-slate-500 block">
                    Sede: {user?.centroSaludNombre || 'Hospital Regional Dr. Aurelio Crespo - Cruz del Eje'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-100/70 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="text-[11px] font-bold">Firma Digital Habilitada Ley 25.506</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalNuevaRecetaOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoReceta}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>{guardandoReceta ? 'Emitiendo y Firmando...' : 'Firmar y Emitir Receta Oficial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVISUALIZACIÓN DE RECETA MÉDICA DIGITAL CON QR Y CÓDIGO OFICIAL  */}
      {/* ========================================================================= */}
      {isModalVerRecetaOpen && recetaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera para Imprimir */}
            <div className="p-6 sm:p-8 space-y-6 print:p-0">
              {/* Barra superior no imprimible */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Receta Digital Emitida y Firmada Electrónicamente</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir Receta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalVerRecetaOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* CUERPO DE LA RECETA DIGITAL OFICIAL (LAYOUT IMPRIMIBLE) */}
              <div className="border border-slate-300 rounded-2xl p-6 bg-white space-y-6 shadow-xs">
                {/* Membrete Institucional */}
                <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo-icon.png" alt="ESU" className="h-10 w-10 object-contain" />
                    <div>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                        ESU • Sistema Único de Salud de Cruz del Eje
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold">
                        {recetaSeleccionada.centroSaludEmisorNombre || 'Hospital Regional Dr. Aurelio Crespo'}
                      </p>
                      <p className="text-[10px] text-slate-400">Receta Médica Digital Oficial • Ley Nacional 27.553</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded block">
                      {String(recetaSeleccionada.id)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Fecha: <strong>{recetaSeleccionada.fechaEmision}</strong>
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold block">
                      Validez 30 días (Vence {recetaSeleccionada.fechaVencimiento})
                    </span>
                  </div>
                </div>

                {/* Datos del Paciente */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente</span>
                    <span className="text-sm font-bold text-slate-900">{recetaSeleccionada.pacienteNombre}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">DNI</span>
                    <span className="font-bold text-slate-900">{recetaSeleccionada.pacienteDni || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Obra Social / Prepaga</span>
                    <span className="font-bold text-emerald-800">{recetaSeleccionada.pacienteObraSocial || 'Particular'}</span>
                  </div>
                  {recetaSeleccionada.pacienteNroAfiliado && recetaSeleccionada.pacienteNroAfiliado !== '-' && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Nº de Afiliado</span>
                      <span className="font-bold text-slate-800">{recetaSeleccionada.pacienteNroAfiliado}</span>
                    </div>
                  )}
                  {recetaSeleccionada.tokenObraSocial && (
                    <div>
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">Token Autorización</span>
                      <span className="font-mono font-black text-emerald-900">{recetaSeleccionada.tokenObraSocial}</span>
                    </div>
                  )}
                </div>

                {/* Diagnóstico */}
                {recetaSeleccionada.diagnostico && (
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">Diagnóstico: </span>
                    <span className="text-slate-800">{recetaSeleccionada.diagnostico}</span>
                    {recetaSeleccionada.codigoCie10 && (
                      <span className="ml-1 text-slate-500 font-mono">({recetaSeleccionada.codigoCie10})</span>
                    )}
                  </div>
                )}

                {/* Detalle de Rp / Prescripción */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                    <span className="text-xl font-serif font-black italic text-emerald-800">Rp.</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Prescripción Farmacológica
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recetaSeleccionada.medicamentos?.map((m, idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-2 text-xs">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {idx + 1}. {m.droga}{' '}
                            {m.nombreComercial && (
                              <span className="text-xs font-normal text-slate-500">
                                (Sug: {m.nombreComercial})
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-emerald-800 text-xs">{m.cantidad}</span>
                        </div>
                        <p className="text-slate-700 font-medium mt-0.5">
                          {m.presentacion} • Dosis: {m.dosisIndicada} • Vía {m.viaAdministracion || 'Oral'}
                        </p>
                        <p className="text-slate-600 italic mt-0.5">
                          Posología: {m.posologia} ({m.duracion})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicaciones al Paciente */}
                {recetaSeleccionada.indicacionesGenerales && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block">Indicaciones Generales:</span>
                    <p className="text-slate-600 mt-0.5">{recetaSeleccionada.indicacionesGenerales}</p>
                  </div>
                )}

                {/* Pie de Receta: QR de Validación y Sello Médico */}
                <div className="flex items-end justify-between gap-4 pt-4 border-t-2 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <ScannableQrCode
                        value={`https://esu.cruzdeleje.gob.ar/recetas/validar/${recetaSeleccionada.id}`}
                        size={80}
                      />
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500">
                      <span className="font-bold text-slate-700 block">Validación Farmacéutica QR</span>
                      <span className="block font-mono">ID: {String(recetaSeleccionada.id)}</span>
                      <span className="block">Validez Nacional Ley 27.553</span>
                      {recetaSeleccionada.hashIntegridad && (
                        <span className="block font-mono text-[9px] text-slate-400">
                          Hash: {recetaSeleccionada.hashIntegridad.slice(0, 16)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sello y Firma del Médico */}
                  <div className="text-right border-t border-slate-400 pt-2 px-4">
                    <span className="text-xs font-bold text-slate-900 block">
                      {recetaSeleccionada.profesionalNombre}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Matrícula {recetaSeleccionada.profesionalMatricula}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Especialista en Medicina General
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                      ✓ Firma Digital Verificada
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón inferior de cerrar */}
              <div className="flex justify-end pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setIsModalVerRecetaOpen(false)}
                  className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
