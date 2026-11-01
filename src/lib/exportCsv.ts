/**
 * Utilidad de exportación a formato CSV compatible con Microsoft Excel (UTF-8 con BOM)
 */
export function exportarAcsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(';'),
    ...rows.map((row) => row.map(escapeCell).join(';')),
  ].join('\r\n');

  // Agregar BOM (\uFEFF) para que Excel abra los acentos en español automáticamente
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
