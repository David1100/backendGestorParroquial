'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { confirmDelete, closeAlert, errorAlert, successAlert } from '@/lib/alerts';

const SUPER_ADMIN_PROFILE = 'Super Admin';
const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const ADMIN_PARROQUIAL_PROFILE = 'Administrador Parroquial';

export default function UsuariosPage() {
  const { usuario, perfil, can } = useAuthStore();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [parroquias, setParroquias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParroquiaId, setSelectedParroquiaId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const isSuperAdmin = perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;
  const targetParroquiaId = isSuperAdmin ? selectedParroquiaId : String(parroquiaId || '');

  useEffect(() => {
    if (isSuperAdmin) {
      loadParroquias();
      return;
    }

    loadData();
  }, [parroquiaId, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && selectedParroquiaId) {
      loadData();
    }
  }, [isSuperAdmin, selectedParroquiaId]);

  const loadParroquias = async () => {
    try {
      const data = await fetchAPI('/parroquias');
      setParroquias(data);
      if (data.length > 0) {
        setSelectedParroquiaId((prev) => prev || String(data[0].id));
      }
    } catch (err) {
      errorAlert(err);
    }
  };

  const loadData = async () => {
    if (!targetParroquiaId) return;
    setLoading(true);
    try {
      const [users, perfis] = await Promise.all([
        fetchAPI(`/parroquias/${targetParroquiaId}/usuarios`),
        fetchAPI(`/parroquias/${targetParroquiaId}/perfiles`),
      ]);
      setUsuarios(users);
      setPerfiles(perfis);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!targetParroquiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    try {
      const payload: Record<string, any> = {
        nombre: data.nombre,
        email: data.email,
        perfilId: data.perfilId,
      };

      if (typeof data.password === 'string' && data.password.trim() !== '') {
        payload.password = data.password;
      }

      if (editingUsuario) {
        await fetchAPI(`/parroquias/${targetParroquiaId}/usuarios/${editingUsuario.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAPI(`/parroquias/${targetParroquiaId}/usuarios`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setEditingUsuario(null);
      loadData();
      successAlert(editingUsuario ? 'Usuario actualizado' : 'Usuario creado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminara el usuario seleccionado');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${targetParroquiaId}/usuarios/${item.id}`, {
        method: 'DELETE',
      });
      closeAlert();
      loadData();
      successAlert('Usuario eliminado');
    } catch (err) {
      closeAlert();
      errorAlert(err);
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'perfil', label: 'Perfil' },
    { key: 'activo', label: 'Estado' },
  ];

  const data = usuarios.map((u) => ({
    ...u,
    activo: u.activo ? 'Activo' : 'Inactivo',
    perfil: u.perfil?.nombre,
  }));

  const puedeAsignarSuperAdmin = isSuperAdmin;
  const perfilActual = editingUsuario?.perfil?.nombre;
  const perfilesDisponibles = perfiles.filter((perfil) => {
    if (isSuperAdmin) {
      return perfil.nombre === ADMIN_PARROQUIAL_PROFILE;
    }

    if (puedeAsignarSuperAdmin) {
      return true;
    }

    if (perfil.nombre !== SUPER_ADMIN_PROFILE) {
      return true;
    }

    return perfilActual === SUPER_ADMIN_PROFILE;
  });

  const fields = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: !editingUsuario },
    {
      name: 'perfilId',
      label: 'Perfil',
      type: 'select',
      options: perfilesDisponibles.map((p) => ({ value: String(p.id), label: p.nombre })),
      required: true,
    },
  ];

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
          <h3 className="text-2xl font-bold">Gestión de Usuarios</h3>
          <p className="mt-1 text-sm text-white/85">Administra los accesos por parroquia y perfil.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {isSuperAdmin && (
          <div className="mr-auto min-w-[280px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">Parroquia</label>
            <select
              value={selectedParroquiaId}
              onChange={(e) => setSelectedParroquiaId(e.target.value)}
              className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-2.5 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
            >
              {parroquias.map((parroquia) => (
                <option key={parroquia.id} value={String(parroquia.id)}>
                  {parroquia.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {can('usuarios', 'crear') && (
          <motion.button
            onClick={() => {
              setEditingUsuario(null);
              setIsModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Crear Usuario
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          canEdit={can('usuarios', 'editar')}
          canDelete={can('usuarios', 'eliminar')}
          onEdit={(item) => {
            const original = usuarios.find((u) => u.id === item.id);
            setEditingUsuario(original);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUsuario(null);
        }}
        title={editingUsuario ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <Form
          fields={fields}
          initialData={editingUsuario}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingUsuario(null);
          }}
          submitLabel={editingUsuario ? 'Actualizar' : 'Crear'}
          simple
        />
      </Modal>
    </div>
  );
}
