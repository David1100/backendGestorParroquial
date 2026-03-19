'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onExport?: (item: any) => void;
  onExportEspecial?: (item: any) => void;
  onPermissions?: (item: any) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canExportEspecial?: boolean;
  canPermissions?: boolean;
  filterable?: boolean;
  filterKeys?: string[];
}

export default function Table({ columns, data, onEdit, onDelete, onExport, onExportEspecial, onPermissions, canEdit, canDelete, canExport, canExportEspecial, canPermissions, filterable = false, filterKeys = [] }: TableProps) {
  const hasActions = Boolean(canEdit || canDelete || canExport || canExportEspecial || canPermissions);
  const [filters, setFilters] = useState<Record<string, string>>({});

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

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {filterable && filterKeys.length > 0 && (
              <tr className="bg-gradient-to-r from-slate-50 via-white to-slate-50">
                {columns.map((col) => (
                  <th key={`filter-${col.key}`} className="px-4 py-3">
                    {filterKeys.includes(col.key) ? (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={col.label}
                          value={filters[col.key] || ''}
                          onChange={(e) => handleFilterChange(col.key, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                        {filters[col.key] && (
                          <button
                            onClick={() => handleFilterChange(col.key, '')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">-</span>
                    )}
                  </th>
                ))}
                {hasActions && <th className="px-4 py-3"></th>}
              </tr>
            )}
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
                      {col.key.includes('fecha') || col.key.includes('Fecha') ? (
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
