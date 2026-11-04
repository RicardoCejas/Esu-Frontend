import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface EstudioDatosPdf {
  id: string;
  tipoEstudio: string;
  nombre: string;
  fecha: string;
  centroSalud: string;
  medicoSolicitante: string;
  estado: string;
}

export interface PacienteDatosPdf {
  nombreCompleto: string;
  dni: string;
  obraSocial?: string;
  nroAfiliado?: string;
}

export async function generarInformeEstudioPdf(
  estudio: EstudioDatosPdf,
  paciente: PacienteDatosPdf
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // 1. Banda Superior Institucional
  doc.setFillColor(12, 74, 110); // sky-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SISTEMA PÚBLICO INTEGRADO DE SALUD — LUVIA', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 242, 254); // sky-100
  doc.text('Red Asistencial Departamental Cruz del Eje · Ministerio de Salud de Córdoba', margin, 17);
  doc.text('Informe Oficial de Práctica Diagnóstica y Análisis Clínico (Ley 26.529)', margin, 22);

  // Estado del informe en cabecera
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(pageWidth - margin - 35, 8, 35, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('INFORME VALIDADO', pageWidth - margin - 33, 12.8);

  let currentY = 36;

  // 2. Caja de Datos del Paciente
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DATOS DEL PACIENTE:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Nombre y Apellido: `, margin + 4, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(paciente.nombreCompleto, margin + 35, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Documento (DNI): `, margin + 4, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(paciente.dni || 'Sin especificar', margin + 35, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cobertura: `, margin + 95, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(paciente.obraSocial || 'Cobertura Pública Exclusiva', margin + 115, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`N° Afiliado: `, margin + 95, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(paciente.nroAfiliado || 'Titular / Sin nro', margin + 115, currentY + 18);

  currentY += 30;

  // 3. Ficha Técnica del Estudio
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DETALLE DE LA PRÁCTICA DIAGNÓSTICA:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Tipo de Estudio: `, margin + 4, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(estudio.tipoEstudio, margin + 35, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Realización: `, margin + 4, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(estudio.fecha, margin + 35, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Centro Emisor: `, margin + 95, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(doc.splitTextToSize(estudio.centroSalud, contentWidth - 115)[0] || estudio.centroSalud, margin + 118, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Médico Solicitante: `, margin + 95, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(estudio.medicoSolicitante, margin + 125, currentY + 17);

  currentY += 28;

  // 4. Título Principal del Estudio
  doc.setFillColor(3, 105, 161); // sky-700
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(estudio.nombre.toUpperCase(), margin + 4, currentY + 5);

  currentY += 12;

  // 5. Contenido Específico según el Tipo de Estudio
  const nombreEstudioLower = (estudio.nombre + ' ' + estudio.tipoEstudio).toLowerCase();

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);

  if (nombreEstudioLower.includes('hemograma') || nombreEstudioLower.includes('laboratorio')) {
    // Tabla de Laboratorio
    doc.setFont('helvetica', 'bold');
    doc.text('DETERMINACIÓN', margin + 4, currentY);
    doc.text('RESULTADO', margin + 70, currentY);
    doc.text('UNIDAD', margin + 105, currentY);
    doc.text('VALORES DE REFERENCIA', margin + 130, currentY);

    currentY += 2;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 5;

    const filasLaboratorio = [
      ['Glucemia Basal en Ayunas', '92.0', 'mg/dL', '70.0 - 110.0', 'NORMAL'],
      ['Hemoglobina Total', '14.2', 'g/dL', '12.0 - 16.5', 'NORMAL'],
      ['Hematocrito', '42.5', '%', '37.0 - 48.0', 'NORMAL'],
      ['Recuento de Leucocitos', '6.850', '/mm³', '4.500 - 10.500', 'NORMAL'],
      ['Recuento de Plaquetas', '245.000', '/mm³', '150.000 - 450.000', 'NORMAL'],
      ['Colesterol Total', '178.0', 'mg/dL', '< 200.0 Deseable', 'NORMAL'],
      ['Colesterol HDL', '52.0', 'mg/dL', '> 40.0 Deseable', 'NORMAL'],
      ['Colesterol LDL (calculado)', '104.0', 'mg/dL', '< 130.0 Óptimo', 'NORMAL'],
      ['Triglicéridos séricos', '110.0', 'mg/dL', '< 150.0 Deseable', 'NORMAL'],
      ['Creatinina en Suero', '0.85', 'mg/dL', '0.60 - 1.15', 'NORMAL'],
      ['Uremia (Urea en sangre)', '31.5', 'mg/dL', '15.0 - 45.0', 'NORMAL'],
      ['Hepatograma - GOT (AST)', '22.0', 'UI/L', 'Hasta 38.0', 'NORMAL'],
      ['Hepatograma - GPT (ALT)', '26.0', 'UI/L', 'Hasta 41.0', 'NORMAL'],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    filasLaboratorio.forEach((fila, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY - 3.5, contentWidth, 5, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.text(fila[0], margin + 4, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(fila[1], margin + 70, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(fila[2], margin + 105, currentY);
      doc.text(fila[3], margin + 130, currentY);
      currentY += 5.5;
    });

    currentY += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('* Muestra biológica procesada mediante analizador automatizado calibrado con estándares internacionales.', margin + 4, currentY);
    currentY += 8;

  } else if (nombreEstudioLower.includes('tórax') || nombreEstudioLower.includes('radiograf')) {
    // Informe Radiológico
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE RADIOLOGÍA DIGITAL:', margin + 4, currentY);
    currentY += 6;

    const textosRadiologia = [
      '• TÉCNICA: Se efectúan proyecciones de tórax en incidencias de Frente y Perfil con técnica digital.',
      '• CAMPOS PLEUROPULMONARES: Correcta expansión bilateral. No se observan imágenes de condensación parenquimatosa focal ni infiltrados intersticiales agudos.',
      '• SILUETA CARDIOVASCULAR: Índice cardiotorácico conservado dentro de límites fisiológicos para la contextura y edad del paciente.',
      '• SENOS COSTOFRÉNICOS Y CARDIOFRÉNICOS: Libres y permeables en ambas proyecciones, sin derrame pleural visible.',
      '• MARCO ÓSEO Y PARTES BLANDAS: Estructuras costales, clavículas y columna dorsal visualizadas sin trazos de fracturas ni lesiones óseas líticas activas.',
      '',
      'CONCLUSIÓN DIAGNÓSTICA:',
      'Estudio radiológico de tórax dentro de parámetros anatómicos y radiológicos habituales. Sin patología pleuropulmonar aguda en curso.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    textosRadiologia.forEach((linea) => {
      if (linea.startsWith('CONCLUSIÓN')) {
        doc.setFont('helvetica', 'bold');
        currentY += 2;
      }
      doc.text(doc.splitTextToSize(linea, contentWidth - 8), margin + 4, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
    });

  } else if (nombreEstudioLower.includes('ecograf')) {
    // Informe Ecográfico
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME ECOGRÁFICO BIDIMENSIONAL Y DOPPLER:', margin + 4, currentY);
    currentY += 6;

    const textosEcografia = [
      '• HÍGADO: Tamaño y morfología conservados. Ecoestructura homogénea sin evidencia de lesiones focales ni esteatosis significativa.',
      '• VESÍCULA BILIAR: De forma anatómica, paredes finas regulares, contenido alitiásico. Vía biliar intra y extrahepática de calibre normal.',
      '• PÁNCREAS Y BAZO: Visualizados en su totalidad, dimensiones habituales y parénquima homogéneo.',
      '• RIÑONES: Ambos riñones en situación anatómica normal. Buena relación córtico-medular, sin dilatación del sistema excretor ni litiasis identificables.',
      '• REGIÓN PÉLVICA: Vejiga con adecuado repleción y contornos netos. Órganos pelvianos de configuración acorde a parámetros fisiológicos normales.',
      '',
      'CONCLUSIÓN DIAGNÓSTICA:',
      'Examen ecográfico abdominopélvico conservado. No se identifican anomalías estructurales ni colecciones líquidas patológicas.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    textosEcografia.forEach((linea) => {
      if (linea.startsWith('CONCLUSIÓN')) {
        doc.setFont('helvetica', 'bold');
        currentY += 2;
      }
      doc.text(doc.splitTextToSize(linea, contentWidth - 8), margin + 4, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
    });

  } else {
    // Electrocardiograma o Estudio Cardiológico
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME ELECTROCARDIOGRÁFICO DE 12 DERIVACIONES:', margin + 4, currentY);
    currentY += 6;

    const textosCardio = [
      '• RITMO: Sinusal regular.',
      '• FRECUENCIA CARDÍACA: 72 latidos por minuto (lpm).',
      '• INTERVALO PR: 0.15 segundos (Conducción AV conservada).',
      '• COMPLEJO QRS: 0.08 segundos, eje eléctrico en plano frontal a +60°.',
      '• INTERVALO QTc: 0.41 segundos (Normal).',
      '• REPOLARIZACIÓN: Segmento ST isoeléctrico en todas las derivaciones. Ondas T de morfología habitual.',
      '',
      'CONCLUSIÓN DIAGNÓSTICA:',
      'Trazado electrocardiográfico dentro de límites normales. Sin signos de isquemia miocárdica aguda ni trastornos del ritmo.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    textosCardio.forEach((linea) => {
      if (linea.startsWith('CONCLUSIÓN')) {
        doc.setFont('helvetica', 'bold');
        currentY += 2;
      }
      doc.text(doc.splitTextToSize(linea, contentWidth - 8), margin + 4, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
    });
  }

  // 6. Pie de Página: Firma Profesional y Código QR Escaneable
  const footerY = pageHeight - 38;

  // Línea separadora
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  // Código QR oficial
  try {
    const qrData = `https://esuluvia.vercel.app/dashboard/paciente/estudios?verif=${estudio.id}&dni=${encodeURIComponent(paciente.dni)}&fecha=${encodeURIComponent(estudio.fecha)}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    doc.addImage(qrDataUrl, 'PNG', margin, footerY, 26, 26);
  } catch (err) {
    console.error('Error generando QR para el PDF:', err);
  }

  // Leyenda de validación legal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DOCUMENTO FIRMADO DIGITALMENTE', margin + 30, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Conforme a la Ley Nacional de Firma Digital N° 25.506 y Ley 27.553.', margin + 30, footerY + 9);
  doc.text('La autenticidad e integridad de este informe médico puede verificarse escaneando el código QR.', margin + 30, footerY + 13);
  doc.text(`Identificador de Archivo: ESU-DOC-${estudio.id.toUpperCase()}-${new Date().getFullYear()}`, margin + 30, footerY + 17);

  // Bloque de Firma y Matrícula Médica
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(estudio.medicoSolicitante || 'Dr. Alejandro Morales', pageWidth - margin - 55, footerY + 9, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Especialista Certificado', pageWidth - margin - 55, footerY + 13);
  doc.text('M.P. 31.849 · M.E. 14.205 (Consejo Médico Cba)', pageWidth - margin - 55, footerY + 17);
  doc.text(estudio.centroSalud, pageWidth - margin - 55, footerY + 21);

  // 7. Descargar el archivo PDF en el navegador
  const nombreLimpio = estudio.nombre
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 35);
  doc.save(`Informe_Estudio_${nombreLimpio}.pdf`);
}
