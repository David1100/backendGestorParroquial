'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

const fields = [
  { name: 'nombres', label: 'Nombre(s)', required: true, section: 'CATEQUIZANDO' },
  { name: 'apellidos', label: 'Apellido(s)', required: true, section: 'CATEQUIZANDO' },
  { name: 'fechaNacimiento', label: 'Fec. Nacimiento', type: 'date', section: 'CATEQUIZANDO' },
  { name: 'lugarNacimiento', label: 'Lugar Nacimiento', section: 'CATEQUIZANDO' },
  { name: 'genero', label: 'Género', type: 'select', options: [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' }
  ], section: 'CATEQUIZANDO' },
  { name: 'direccion', label: 'Dirección', section: 'CATEQUIZANDO' },
  { name: 'telefono', label: 'Teléfono', section: 'CATEQUIZANDO' },
  { name: 'email', label: 'Correo electrónico', section: 'CATEQUIZANDO' },

  { name: 'nombrePadre', label: 'Nombre del padre', section: 'FAMILIA' },
  { name: 'telefonoPadre', label: 'Teléfono padre', section: 'FAMILIA' },
  { name: 'nombreMadre', label: 'Nombre de la madre', section: 'FAMILIA' },
  { name: 'telefonoMadre', label: 'Teléfono madre', section: 'FAMILIA' },
  { name: 'nombreAcudiente', label: 'Acudiente', section: 'FAMILIA' },
  { name: 'telefonoAcudiente', label: 'Teléfono acudiente', section: 'FAMILIA' },

  { name: 'grupoId', label: 'Grupo', type: 'select', options: [], section: 'ASIGNACION' },
  { name: 'estado', label: 'Estado', type: 'select', options: [
    { value: 'activo', label: 'Activo' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'retirado', label: 'Retirado' }
  ], section: 'ASIGNACION' },
  { name: 'fechaInicio', label: 'Fecha inicio', type: 'date', section: 'ASIGNACION' },

  { name: 'observaciones', label: 'Notas / observaciones', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombres', label: 'Nombre' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'grupos', label: 'Grupos' },
  { key: 'estado', label: 'Estado' },
  { key: 'fechaInicio', label: 'Fecha Inicio' },
];

export default function CatequesisPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const parroqusiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadData();
    loadGrupos();
  }, [parroqusiaId]);

  const loadGrupos = async () => {
    if (!parroqusiaId) return;
    try {
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/grupos`);
      setGrupos(result);
    } catch (err) {
      console.error('Error loading grupos:', err);
    }
  };

  const loadData = async () => {
    if (!parroqusiaId) return;
    setLoading(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/catequesis`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const getGruposOptions = () => {
    return grupos.map((g: any) => ({ value: String(g.id), label: g.nombre }));
  };

  const getFieldsWithGrupos = () => {
    return fields.map(field => {
      if (field.name === 'grupoId') {
        return { ...field, options: getGruposOptions() };
      }
      return field;
    });
  };

  const buildPayload = (formData: any) => {
    const payload: Record<string, any> = {};
    const fieldsToUse = getFieldsWithGrupos();

    for (const field of fieldsToUse) {
      const rawValue = formData?.[field.name];

      if (rawValue === undefined) continue;

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

      payload[field.name] = rawValue;
    }

    return payload;
  };

  const handleSubmit = async (formData: any) => {
    if (!parroqusiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    try {
      const payload = buildPayload(formData);
      
      if (payload.grupoId) {
        payload.grupoId = Number(payload.grupoId);
      }

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `/parroquias/${parroqusiaId}/catequesis/${editingItem.id}`
        : `/parroquias/${parroqusiaId}/catequesis`;
      
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
      await fetchAPI(`/parroquias/${parroqusiaId}/catequesis/${item.id}`, {
        method: 'DELETE',
      });

      loadData();
      successAlert('Registro eliminado');
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

  const getGruposLabel = (item: any) => {
    if (!item.grupo) return '-';
    return item.grupo.nombre;
  };

  const getInitialData = () => {
    if (!editingItem) return {};
    return {
      ...editingItem,
      grupoId: editingItem.grupoId?.toString() || '',
    };
  };

  return (
    <div className="space-y-6">
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold">Gestion de Catequesis</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros de catequesis.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('catequesis', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-amber-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {loading ? (
          <LoadingSpinner message="Cargando catequesis..." />
        ) : (
        <Table
          columns={columns}
          data={data}
          canEdit={can('catequesis', 'editar')}
          canDelete={can('catequesis', 'eliminar')}
          canExport={false}
          canExportEspecial={false}
          onEdit={openModal}
          onDelete={handleDelete}
          filterable={true}
          filterKeys={['nombres', 'apellidos', 'estado', 'nombrePadre', 'nombreMadre']}
          renderCell={(key, item) => {
            if (key === 'grupos') {
              return getGruposLabel(item);
            }
            return null;
          }}
        />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Registro' : 'Nuevo Registro'}
      >
        <Form
          fields={getFieldsWithGrupos()}
          initialData={getInitialData()}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={editingItem ? 'Actualizar' : 'Crear'}
        />
      </Modal>
    </div>
  );
}
