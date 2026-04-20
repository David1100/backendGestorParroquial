'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

export default function ParroquiasPage() {
  const { can } = useAuthStore();
  const [parroquias, setParroquias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/parroquias');
      setParroquias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingItem) {
        const payload = {
          nombre: data.nombre,
          ciudad: data.ciudad,
          direccion: data.direccion,
          telefono: data.telefono,
        };

        await fetchAPI(`/parroquias/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        successAlert('Parroquia actualizada');
      } else {
        await fetchAPI('/parroquias', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        successAlert('Parroquia creada con administrador inicial');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminara la parroquia y sus datos relacionados');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${item.id}`, { method: 'DELETE' });
      loadData();
      successAlert('Parroquia eliminada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'adminEmail', label: 'Administrador' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'telefono', label: 'Teléfono' },
  ];

  const baseFields = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'ciudad', label: 'Ciudad', required: true },
    { name: 'direccion', label: 'Dirección' },
    { name: 'telefono', label: 'Teléfono' },
  ];

  const createAdminFields = [
    { name: 'adminNombre', label: 'Nombre del administrador', required: !editingItem },
    { name: 'adminEmail', label: 'Email del administrador', type: 'email', required: !editingItem },
    { name: 'adminPassword', label: 'Clave temporal', type: 'password', required: !editingItem },
  ];

  const fields = editingItem ? baseFields : [...baseFields, ...createAdminFields];

  const data = parroquias.map((parroquia) => {
    const admin = parroquia.usuarios?.find((u: any) => u.perfil?.nombre === 'Administrador Parroquial');
    return {
      ...parroquia,
      adminEmail: admin?.email || '-',
    };
  });

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
          <h3 className="text-2xl font-bold">Gestión de Parroquias</h3>
          <p className="mt-1 text-sm text-white/85">Crea sedes parroquiales y organiza su administración.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('parroquias', 'crear') && (
          <motion.button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Nueva Parroquia
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          canEdit={can('parroquias', 'editar')}
          canDelete={can('parroquias', 'eliminar')}
          onEdit={(item) => {
            const original = data.find((p) => p.id === item.id);
            setEditingItem(original);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Editar Parroquia' : 'Nueva Parroquia'}
      >
        <Form
          fields={fields}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          submitLabel={editingItem ? 'Actualizar' : 'Crear'}
          simple
        />
      </Modal>
    </div>
  );
}
