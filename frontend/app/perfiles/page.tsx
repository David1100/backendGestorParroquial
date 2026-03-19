'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

const MODULOS = [
  'usuarios', 'perfiles', 'parroquias', 'bautizos', 'comuniones', 'confirmaciones',
  'matrimonios', 'difuntos', 'catequesis', 'donaciones', 'inventario', 'permisos',
  'eventos', 'reportes', 'citas'
];

type PermisosPorModulo = Record<
  string,
  {
    modulo: string;
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  }
>;

const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'] as const;

export default function PerfilesPage() {
  const { usuario, can } = useAuthStore();
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermisosOpen, setIsPermisosOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<any>(null);
  const [permisos, setPermisos] = useState<PermisosPorModulo>({});
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadPerfiles();
  }, [parroquiaId]);

  const loadPerfiles = async () => {
    if (!parroquiaId) return;
    try {
      const data = await fetchAPI(`/parroquias/${parroquiaId}/perfiles`);
      setPerfiles(data);
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!parroquiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    try {
      if (editingPerfil) {
        await fetchAPI(`/parroquias/${parroquiaId}/perfiles/${editingPerfil.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        await fetchAPI(`/parroquias/${parroquiaId}/perfiles`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      setIsModalOpen(false);
      setEditingPerfil(null);
      loadPerfiles();
      successAlert(editingPerfil ? 'Perfil actualizado' : 'Perfil creado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminara el perfil seleccionado');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/perfiles/${item.id}`, {
        method: 'DELETE',
      });
      loadPerfiles();
      successAlert('Perfil eliminado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const openPermisos = async (perfil: any) => {
    setEditingPerfil(perfil);
    try {
      const data = await fetchAPI(`/parroquias/${parroquiaId}/perfiles/${perfil.id}/permisos`);
      const permisosMap: PermisosPorModulo = {};
      data.forEach((p: any) => {
        permisosMap[p.modulo] = p;
      });
      setPermisos(permisosMap);
      setIsPermisosOpen(true);
    } catch (err) {
      errorAlert(err);
    }
  };

  const savePermisos = async () => {
    const permisosData = MODULOS.map((modulo) => ({
      modulo,
      ver: permisos[modulo]?.ver || false,
      crear: permisos[modulo]?.crear || false,
      editar: permisos[modulo]?.editar || false,
      eliminar: permisos[modulo]?.eliminar || false,
    }));
    try {
      await fetchAPI(`/parroquias/${parroquiaId}/perfiles/${editingPerfil.id}/permisos`, {
        method: 'PUT',
        body: JSON.stringify(permisosData),
      });
      setIsPermisosOpen(false);
      successAlert('Permisos guardados');
    } catch (err) {
      errorAlert(err);
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ];

  const fields = [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'descripcion', label: 'Descripción' },
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
          <h3 className="text-2xl font-bold">Gestión de Perfiles</h3>
          <p className="mt-1 text-sm text-white/85">Define roles y controla permisos por módulo.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('perfiles', 'crear') && (
          <motion.button
            onClick={() => {
              setEditingPerfil(null);
              setIsModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Crear Perfil
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={perfiles}
          canEdit={can('perfiles', 'editar')}
          canDelete={can('perfiles', 'eliminar')}
          canPermissions={can('perfiles', 'editar')}
          onEdit={(item) => {
            const original = perfiles.find((p) => p.id === item.id);
            setEditingPerfil(original);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          onPermissions={(item) => {
            const original = perfiles.find((p) => p.id === item.id);
            if (original) {
              openPermisos(original);
            }
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPerfil(null);
        }}
        title={editingPerfil ? 'Editar Perfil' : 'Crear Perfil'}
      >
        <Form
          fields={fields}
          initialData={editingPerfil}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPerfil(null);
          }}
          submitLabel={editingPerfil ? 'Actualizar' : 'Crear'}
        />
      </Modal>

      <Modal
        isOpen={isPermisosOpen}
        onClose={() => setIsPermisosOpen(false)}
        title={`Permisos: ${editingPerfil?.nombre}`}
      >
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Módulo</th>
                <th className="text-center py-2">Ver</th>
                <th className="text-center py-2">Crear</th>
                <th className="text-center py-2">Editar</th>
                <th className="text-center py-2">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((modulo) => (
                <tr key={modulo} className="border-t">
                  <td className="py-2 capitalize">{modulo}</td>
                  {ACCIONES.map((accion) => (
                    <td key={accion} className="text-center">
                      <input
                        type="checkbox"
                        checked={permisos[modulo]?.[accion] || false}
                        onChange={(e) => {
                          setPermisos((prev) => ({
                            ...prev,
                            [modulo]: {
                              ...prev[modulo],
                              modulo,
                              [accion]: e.target.checked,
                            },
                          }));
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={savePermisos}
            className="bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Guardar Permisos
          </button>
        </div>
      </Modal>
    </div>
  );
}
