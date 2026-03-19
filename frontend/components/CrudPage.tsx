'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

interface Field {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface CrudPageProps {
  module: string;
  columns: { key: string; label: string }[];
  fields: Field[];
  onExportEspecial?: (item: any) => void;
}

const MODULE_NAMES: Record<string, string> = {
  bautizos: 'Bautizos',
  comuniones: 'Comuniones',
  catequesis: 'Catequesis',
  confirmaciones: 'Confirmaciones',
  difuntos: 'Difuntos',
  donaciones: 'Donaciones',
  eventos: 'Eventos',
  inventario: 'Inventario',
  matrimonios: 'Matrimonios',
  reportes: 'Reportes',
  citas: 'Citas',
};

const EXPORTABLE_MODULES = new Set(['bautizos', 'comuniones', 'confirmaciones', 'matrimonios', 'difuntos']);
const EXPORT_ESPECIAL_MODULES = new Set(['bautizos', 'comuniones', 'confirmaciones', 'matrimonios', 'difuntos']);

export default function CrudPage({ module, columns, fields, onExportEspecial }: CrudPageProps) {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  const loadData = async () => {
    if (!parroquiaId) return;
    try {
      const result = await fetchAPI(`/parroquias/${parroquiaId}/${module}`);
      setData(result);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [parroquiaId, module]);

  const buildPayload = (formData: any) => {
    const payload: Record<string, any> = {};

    for (const field of fields) {
      const rawValue = formData?.[field.name];

      if (rawValue === undefined) {
        continue;
      }

      if (rawValue === '') {
        payload[field.name] = null;
        continue;
      }

      if (field.type === 'number') {
        const parsed = Number(rawValue);
        payload[field.name] = Number.isNaN(parsed) ? null : parsed;
        continue;
      }

      if (field.type === 'date') {
        const parsedDate = String(rawValue).includes('T')
          ? new Date(rawValue)
          : new Date(`${rawValue}T00:00:00`);
        payload[field.name] = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
        continue;
      }

      if (field.type === 'datetime-local') {
        const parsedDateTime = new Date(rawValue);
        payload[field.name] = Number.isNaN(parsedDateTime.getTime()) ? null : parsedDateTime.toISOString();
        continue;
      }

      payload[field.name] = rawValue;
    }

    return payload;
  };

  const handleSubmit = async (formData: any) => {
    if (!parroquiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    try {
      const payload = buildPayload(formData);
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `/parroquias/${parroquiaId}/${module}/${editingItem.id}`
        : `/parroquias/${parroquiaId}/${module}`;
      
      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });
      
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Registro actualizado' : 'Registro creado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminara este registro');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/${module}/${item.id}`, {
        method: 'DELETE',
      });

      loadData();
      successAlert('Registro eliminado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleExport = async (item: any) => {
    if (!parroquiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroquiaId}/partidas/${module}/${item.id}/pdf`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error('No se pudo exportar el PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `partida-${module}-${item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      successAlert('PDF exportado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleExportEspecial = async (item: any) => {
    if (onExportEspecial) {
      onExportEspecial(item);
      return;
    }

    if (!parroquiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroquiaId}/partidas/${module}/${item.id}/pdf-especial`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error('No se pudo exportar el PDF especial');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nota-marginal-${module}-${item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      successAlert('Nota Marginal exportada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const moduleName = MODULE_NAMES[module] || module;
  const singularName = moduleName.endsWith('s') ? moduleName.slice(0, -1) : moduleName;

  return (
    <div className="space-y-6">
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold">Gestión de {moduleName}</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros del módulo de {moduleName.toLowerCase()}.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can(module, 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo {singularName}
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={data}
          canEdit={can(module, 'editar')}
          canDelete={can(module, 'eliminar')}
          canExport={EXPORTABLE_MODULES.has(module) && can('reportes', 'ver')}
          canExportEspecial={EXPORT_ESPECIAL_MODULES.has(module) && can('reportes', 'ver')}
          onEdit={openModal}
          onDelete={handleDelete}
          onExport={handleExport}
          onExportEspecial={handleExportEspecial}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? `Editar ${singularName}` : `Nuevo ${singularName}`}
      >
        <Form
          fields={fields}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={editingItem ? 'Actualizar' : 'Crear'}
        />
      </Modal>
    </div>
  );
}
