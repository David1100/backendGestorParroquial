'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onExport?: (item: any) => void;
  onExportEspecial?: (item: any) => void;
  onExportRecordatorio?: (item: any) => void;
  onPermissions?: (item: any) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canExportEspecial?: boolean;
  canExportRecordatorio?: boolean;
  canPermissions?: boolean;
  filterable?: boolean;
  filterKeys?: string[];
  filterLabels?: Record<string, string>;
  canExportData?: boolean;
  exportFilename?: string;
  exportKeys?: string[];
  exportLabels?: Record<string, string>;
  renderCell?: (key: string, item: any) => JSX.Element | null | string | number;
}

export default function Table({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onExport,
  onExportEspecial,
  onExportRecordatorio,
  onPermissions,
  canEdit,
  canDelete,
  canExport,
  canExportEspecial,
  canExportRecordatorio,
  canPermissions,
  filterable = false,
  filterKeys = [],
  filterLabels = {},
  canExportData = false,
  exportFilename = 'registros',
  exportKeys,
  exportLabels = {},
  renderCell,
}: TableProps) {
  const hasActions = Boolean(canEdit || canDelete || canExport || canExportEspecial || canExportRecordatorio || canPermissions);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const keyToLabel = (key: string) => {
    if (filterLabels[key]) return filterLabels[key];
    if (exportLabels[key]) return exportLabels[key];
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, (char) => char.toUpperCase());
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    if (!filterable || filterKeys.length === 0) return data;

    return data.filter(item => {
      return filterKeys.every(key => {
        const filterValue = filters[key]?.toLowerCase().trim();
        if (!filterValue) return true;
        const itemValue = item[key]?.toString().toLowerCase();
        return itemValue?.includes(filterValue);
      });
    });
  }, [data, filters, filterable, filterKeys]);

  const effectiveExportKeys = useMemo(() => {
    if (exportKeys && exportKeys.length > 0) {
      return exportKeys;
    }

    const base = columns.map((column) => column.key);
    const recordKeys = ['libro', 'folio', 'numero'];
    const withRecordKeys = [...base];

    for (const key of recordKeys) {
      const hasAnyValue = data.some((item) => item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '');
      if (hasAnyValue && !withRecordKeys.includes(key)) {
        withRecordKeys.push(key);
      }
    }

    return withRecordKeys;
  }, [columns, data, exportKeys]);

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return '-';

    if (key.toLowerCase().includes('fecha')) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      }
    }

    return String(value);
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const exportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = effectiveExportKeys.map((key) => keyToLabel(key));
    const rows = filteredData.map((item) =>
      effectiveExportKeys.map((key) => {
        const value = formatValue(key, item?.[key]);
        const escaped = String(value).replaceAll('"', '""');
        return `"${escaped}"`;
      }),
    );

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (filteredData.length === 0) return;

    const headers = effectiveExportKeys.map((key) => `<th>${escapeHtml(keyToLabel(key))}</th>`).join('');
    const bodyRows = filteredData
      .map((item) => {
        const cells = effectiveExportKeys
          .map((key) => `<td>${escapeHtml(formatValue(key, item?.[key]))}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(exportFilename)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2 { margin: 0 0 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h2>${escapeHtml(exportFilename)}</h2>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const hasActiveFilters = filterKeys.some((key) => Boolean(filters[key]?.trim()));

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner message="Cargando datos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      {(filterable || canExportData) && (
        <div className="border-b border-indigo-100 bg-slate-50/80 px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            {filterable && filterKeys.map((key) => (
              <div key={key} className="min-w-[130px] flex-1">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  {keyToLabel(key)}
                </label>
                <input
                  type="text"
                  value={filters[key] || ''}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  placeholder={`Filtrar por ${keyToLabel(key).toLowerCase()}`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            ))}

            {filterable && hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters({})}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                Limpiar
              </button>
            )}

            {canExportData && (
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={exportCSV}
                  disabled={filteredData.length === 0}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={exportPDF}
                  disabled={filteredData.length === 0}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Exportar PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50">
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {col.label}
                  </motion.span>
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            <AnimatePresence>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="group hover:bg-indigo-50/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-6 py-4 text-sm text-slate-700"
                    >
                      {renderCell ? (
                        renderCell(col.key, item) ?? (
                          col.key.includes('fecha') || col.key.includes('Fecha') ? (
                            item[col.key] ? new Date(item[col.key]).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'
                          ) : (
                            item[col.key]?.toString() || '-'
                          )
                        )
                      ) : col.key.includes('fecha') || col.key.includes('Fecha') ? (
                        item[col.key] ? new Date(item[col.key]).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '-'
                      ) : (
                        item[col.key]?.toString() || '-'
                      )}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {canExportRecordatorio && onExportRecordatorio && (
                          <motion.button
                            onClick={() => onExportRecordatorio(item)}
                            className="rounded-lg p-2 text-cyan-600 transition-colors hover:bg-cyan-100 hover:text-cyan-800"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Recordatorio"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </motion.button>
                        )}
                        {canExportEspecial && onExportEspecial && (
                          <motion.button
                            onClick={() => onExportEspecial(item)}
                            className="rounded-lg p-2 text-violet-600 transition-colors hover:bg-violet-100 hover:text-violet-800"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Nota Marginal y Partida Especial"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </motion.button>
                        )}
                        {canEdit && onEdit && (
                          <motion.button
                            onClick={() => onEdit(item)}
                            className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-800"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                        )}
                        {canPermissions && onPermissions && (
                          <motion.button
                            onClick={() => onPermissions(item)}
                            className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Gestionar permisos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </motion.button>
                        )}
                        {canDelete && onDelete && (
                          <motion.button
                            onClick={() => onDelete(item)}
                            className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-800"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredData.length === 0 && (
              <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium text-slate-500">No hay datos</p>
                    <p className="text-sm text-slate-400">Comienza agregando nuevos registros</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
