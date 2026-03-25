'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { Modal, Form } from '@/components/Form';
import { motion, AnimatePresence } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

type QuienFirma = {
  id: number;
  nombre: string;
  firmantes: Firmante[];
};

type Firmante = {
  id: number;
  nombre: string;
};

export default function QuienFirmaPage() {
  const { usuario, can } = useAuthStore();
  const [quienesFirma, setQuienesFirma] = useState<QuienFirma[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFirmanteModalOpen, setIsFirmanteModalOpen] = useState(false);
  const [editingQuienFirma, setEditingQuienFirma] = useState<QuienFirma | null>(null);
  const [editingFirmante, setEditingFirmante] = useState<Firmante | null>(null);
  const [selectedQuienFirma, setSelectedQuienFirma] = useState<QuienFirma | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadData();
  }, [parroquiaId]);

  const loadData = async () => {
    if (!parroquiaId) return;
    try {
      const data = await fetchAPI(`/parroquias/${parroquiaId}/quienfirma`);
      setQuienesFirma(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (data: { nombre: string }) => {
    if (!parroquiaId) {
      errorAlert(new Error('No se encontró la parroquia activa'));
      return;
    }

    try {
      if (editingQuienFirma) {
        await fetchAPI(`/parroquias/${parroquiaId}/quienfirma/${editingQuienFirma.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        successAlert('Rol actualizado');
      } else {
        await fetchAPI(`/parroquias/${parroquiaId}/quienfirma`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        successAlert('Rol creado');
      }
      setIsModalOpen(false);
      setEditingQuienFirma(null);
      loadData();
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: QuienFirma) => {
    const ok = await confirmDelete('Se eliminará el rol y todos sus firmantes');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/quienfirma/${item.id}`, {
        method: 'DELETE',
      });
      loadData();
      successAlert('Rol eliminado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleFirmanteSubmit = async (data: { nombre: string }) => {
    if (!parroquiaId || !selectedQuienFirma) return;

    try {
      if (editingFirmante) {
        await fetchAPI(`/parroquias/${parroquiaId}/quienfirma/${selectedQuienFirma.id}/firmantes/${editingFirmante.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        successAlert('Firmante actualizado');
      } else {
        await fetchAPI(`/parroquias/${parroquiaId}/quienfirma/${selectedQuienFirma.id}/firmantes`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        successAlert('Firmante agregado');
      }
      setIsFirmanteModalOpen(false);
      setEditingFirmante(null);
      setSelectedQuienFirma(null);
      loadData();
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDeleteFirmante = async (quienFirma: QuienFirma, firmante: Firmante) => {
    const ok = await confirmDelete('Se eliminará el firmante');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/quienfirma/${quienFirma.id}/firmantes/${firmante.id}`, {
        method: 'DELETE',
      });
      loadData();
      successAlert('Firmante eliminado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const quienFirmaFields = [
    { name: 'nombre', label: 'Rol / Quién Firma', required: true, placeholder: 'Ej: Párroco, Vicario, Secretario' },
  ];

  const firmanteFields = [
    { name: 'nombre', label: 'Nombre del Firmante', required: true, placeholder: 'Ej: Juan Pérez' },
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
          <h3 className="text-2xl font-bold">Gestión de Firmantes</h3>
          <p className="mt-1 text-sm text-white/85">Configura quién firma los documentos y sus nombres.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        <motion.button
          onClick={() => {
            setEditingQuienFirma(null);
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Nuevo Rol
        </motion.button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {quienesFirma.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p>No hay roles configurados</p>
            <p className="text-sm">Crea un rol para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quienesFirma.map((qf) => (
              <motion.div
                key={qf.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === qf.id ? null : qf.id)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: expandedId === qf.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                    <span className="font-medium text-gray-900">{qf.nombre}</span>
                    <span className="text-sm text-gray-500">({qf.firmantes?.length || 0} firmantes)</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedQuienFirma(qf);
                        setEditingFirmante(null);
                        setIsFirmanteModalOpen(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Agregar firmante"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setEditingQuienFirma(qf);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar rol"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(qf)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar rol"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === qf.id && qf.firmantes && qf.firmantes.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 border-t border-gray-200"
                    >
                      <div className="p-4 space-y-2">
                        <p className="text-sm font-medium text-gray-600 mb-3">Firmantes:</p>
                        {qf.firmantes.map((firmante) => (
                          <div
                            key={firmante.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <span className="text-gray-800">{firmante.nombre}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedQuienFirma(qf);
                                  setEditingFirmante(firmante);
                                  setIsFirmanteModalOpen(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteFirmante(qf, firmante)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuienFirma(null);
        }}
        title={editingQuienFirma ? 'Editar Rol' : 'Nuevo Rol'}
      >
        <Form
          fields={quienFirmaFields}
          initialData={editingQuienFirma}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingQuienFirma(null);
          }}
          submitLabel={editingQuienFirma ? 'Actualizar' : 'Crear'}
        />
      </Modal>

      <Modal
        isOpen={isFirmanteModalOpen}
        onClose={() => {
          setIsFirmanteModalOpen(false);
          setEditingFirmante(null);
          setSelectedQuienFirma(null);
        }}
        title={editingFirmante ? 'Editar Firmante' : `Agregar Firmante - ${selectedQuienFirma?.nombre}`}
      >
        <Form
          fields={firmanteFields}
          initialData={editingFirmante}
          onSubmit={handleFirmanteSubmit}
          onCancel={() => {
            setIsFirmanteModalOpen(false);
            setEditingFirmante(null);
            setSelectedQuienFirma(null);
          }}
          submitLabel={editingFirmante ? 'Actualizar' : 'Agregar'}
        />
      </Modal>
    </div>
  );
}
