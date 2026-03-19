'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';

const fields = [
  { name: 'nombres', label: 'Nombre(s)', required: true, section: 'CATEQUIZANDO' },
  { name: 'apellidos', label: 'Apellido(s)', section: 'CATEQUIZANDO' },
  { name: 'fechaNacimiento', label: 'Fec. Nacimiento', type: 'date', section: 'CATEQUIZANDO' },
  { name: 'lugarNacimiento', label: 'Lugar Nacimiento', section: 'CATEQUIZANDO' },
  { name: 'direccion', label: 'Direccion', section: 'CATEQUIZANDO' },
  { name: 'telefono', label: 'Telefono', section: 'CATEQUIZANDO' },
  { name: 'genero', label: 'Genero', type: 'select', options: [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' }
  ], section: 'CATEQUIZANDO' },
  { name: 'email', label: 'Email', section: 'CATEQUIZANDO' },

  { name: 'etapa', label: 'Etapa/Nivel', section: 'ASIGNACION' },
  { name: 'nivelId', label: 'Nivel', section: 'ASIGNACION' },
  { name: 'grupoId', label: 'Grupo', section: 'ASIGNACION' },
  { name: 'catequistaId', label: 'Catequista', section: 'ASIGNACION' },
  { name: 'estado', label: 'Estado', type: 'select', options: [
    { value: 'activo', label: 'Activo' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'retirado', label: 'Retirado' }
  ], section: 'ASIGNACION' },
  { name: 'fechaInicio', label: 'Fecha Inicio', type: 'date', section: 'ASIGNACION' },

  { name: 'bautizado', label: 'Bautizado', type: 'checkbox', section: 'SACRAMENTOS' },
  { name: 'fechaBautismo', label: 'Fecha Bautismo', type: 'date', section: 'SACRAMENTOS' },
  { name: 'partidaBautismoUrl', label: 'Partida Bautismo (URL)', section: 'SACRAMENTOS' },

  { name: 'primeraComunion', label: 'Primera Comunion', type: 'checkbox', section: 'SACRAMENTOS' },
  { name: 'fechaPrimeraComunion', label: 'Fecha Comunion', type: 'date', section: 'SACRAMENTOS' },

  { name: 'confirmacion', label: 'Confirmacion', type: 'checkbox', section: 'SACRAMENTOS' },
  { name: 'fechaConfirmacion', label: 'Fecha Confirmacion', type: 'date', section: 'SACRAMENTOS' },

  { name: 'nombrePadre', label: 'Nombre del Padre', section: 'FAMILIA' },
  { name: 'telefonoPadre', label: 'Telefono Padre', section: 'FAMILIA' },
  { name: 'nombreMadre', label: 'Nombre de la Madre', section: 'FAMILIA' },
  { name: 'telefonoMadre', label: 'Telefono Madre', section: 'FAMILIA' },
  { name: 'nombreAcudiente', label: 'Otro Acudiente', section: 'FAMILIA' },
  { name: 'telefonoAcudiente', label: 'Telefono Acudiente', section: 'FAMILIA' },

  { name: 'contenidoEspecial', label: 'Certificado', type: 'textarea', section: 'ESPECIAL' },

  { name: 'observaciones', label: 'Observaciones', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombres', label: 'Nombre' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'etapa', label: 'Etapa' },
  { key: 'estado', label: 'Estado' },
];

interface FormatoData {
  contenido: string;
  campos: Record<string, string>;
  tipo: string;
}

export default function CatequesisPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formatoData, setFormatoData] = useState<FormatoData | null>(null);
  
  const [isFormatoModalOpen, setIsFormatoModalOpen] = useState(false);
  const [formatoItem, setFormatoItem] = useState<any>(null);
  const [contenidoGenerado, setContenidoGenerado] = useState('');

  const parroqusiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadData();
  }, [parroqusiaId]);

  const loadData = async () => {
    if (!parroqusiaId) return;
    try {
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/catequesis`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    }
  };

  const loadFormatoContent = async () => {
    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=catequesis`);
      const result = await response.json();
      if (result.contenido) {
        setFormatoData({ contenido: result.contenido, campos: result.campos, tipo: 'especial' });
      } else {
        setFormatoData(null);
      }
    } catch (err) {
      console.error(err);
      setFormatoData(null);
    }
  };

  const generateContenidoEspecial = (formData: any, contenidoTemplate: string) => {
    let contenido = contenidoTemplate;
    
    const nombreParroquia = usuario?.parroquia || '';
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} del ${year}`;
    };

    const reemplazos: Record<string, string> = {
      parroquiaconciudad: nombreParroquia?.toUpperCase() || '',
      nombre_catequizando: formData.nombres && formData.apellidos 
        ? `${formData.nombres?.toUpperCase()} ${formData.apellidos?.toUpperCase()}`.trim() 
        : formData.nombres?.toUpperCase() || '',
      nombre: formData.nombres?.toUpperCase() || '',
      apellidos: formData.apellidos?.toUpperCase() || '',
      nivel: formData.etapa || '',
      grupo: formData.grupo?.nombre || formData.grupoId || '',
      fecha_inicio: formatDate(formData.fechaInicio),
      fecha_nacimiento: formatDate(formData.fechaNacimiento),
      lugar_nacimiento: formData.lugarNacimiento || '',
      direccion: formData.direccion || '',
      nombre_catequista: formData.catequista?.nombre || '',
      nombre_padre: formData.nombrePadre || '',
      nombre_madre: formData.nombreMadre || '',
      telefono_padre: formData.telefonoPadre || '',
      telefono_madre: formData.telefonoMadre || '',
      bautizado: formData.bautizado ? 'SI' : 'NO',
      primera_comunion: formData.primeraComunion ? 'SI' : 'NO',
      confirmacion: formData.confirmacion ? 'SI' : 'NO',
      fecha_bautismo: formatDate(formData.fechaBautismo),
      fecha_primera_comunion: formatDate(formData.fechaPrimeraComunion),
      fecha_confirmacion: formatDate(formData.fechaConfirmacion),
      quien_firma: formData.celebrante?.toUpperCase() || '',
      hoy: formatDate(new Date().toISOString()),
    };

    for (const [key, value] of Object.entries(reemplazos)) {
      contenido = contenido.replace(new RegExp(`<${key}>`, 'gi'), value);
    }

    return contenido;
  };

  const buildPayload = (formData: any) => {
    const payload: Record<string, any> = {};

    for (const field of fields) {
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

  const handleExport = async (item: any) => {
    successAlert('Funcionalidad en desarrollo');
  };

  const handleExportEspecial = async (item: any) => {
    if (!parroqusiaId) return;

    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=catequesis`);
      const result = await response.json();
      
      const contenidoGuardado = item.contenidoEspecial;
      
      if (contenidoGuardado) {
        setContenidoGenerado(contenidoGuardado);
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      } else if (result.contenido) {
        const contenido = generateContenidoEspecial(item, result.contenido);
        setContenidoGenerado(contenido);
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      } else {
        setContenidoGenerado('');
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      }
    } catch (err) {
      setContenidoGenerado(item.contenidoEspecial || '');
      setFormatoItem(item);
      setIsFormatoModalOpen(true);
    }
  };

  const handleFormatoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContenidoGenerado(e.target.value);
  };

  const handleGenerarFormato = async () => {
    if (!formatoItem) return;

    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=catequesis`);
      const result = await response.json();
      
      if (result.contenido) {
        const contenido = generateContenidoEspecial(formatoItem, result.contenido);
        setContenidoGenerado(contenido);
      }
    } catch (err) {
      console.error('Error generando formato:', err);
    }
  };

  const handleSaveFormato = async () => {
    if (!parroqusiaId || !formatoItem) return;

    try {
      const token = useAuthStore.getState().token;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/catequesis/${formatoItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            contenidoEspecial: contenidoGenerado,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al guardar');
      }

      loadData();
      successAlert('Certificado guardado');
      setIsFormatoModalOpen(false);
    } catch (err: any) {
      console.error('Error guardando:', err);
      errorAlert(err);
    }
  };

  const handleExportFormatoPDF = async () => {
    if (!parroqusiaId || !formatoItem) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/partidas/catequesis/${formatoItem.id}/pdf-especial`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          method: 'POST',
          body: JSON.stringify({ contenido: contenidoGenerado }),
        },
      );

      if (!response.ok) {
        throw new Error('No se pudo exportar el PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-catequesis-${formatoItem.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      successAlert('PDF exportado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const closeFormatoModal = () => {
    setIsFormatoModalOpen(false);
    setContenidoGenerado('');
    setFormatoItem(null);
  };

  const openModal = (item?: any) => {
    setFormatoData(null);
    setEditingItem(item || null);
    setIsModalOpen(true);
    if (!item) {
      loadFormatoContent();
    }
  };

  const closeModal = () => {
    setFormatoData(null);
    setIsModalOpen(false);
    setEditingItem(null);
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
        <Table
          columns={columns}
          data={data}
          canEdit={can('catequesis', 'editar')}
          canDelete={can('catequesis', 'eliminar')}
          canExport={false}
          canExportEspecial={can('reportes', 'ver')}
          onEdit={openModal}
          onDelete={handleDelete}
          onExport={handleExport}
          onExportEspecial={handleExportEspecial}
          filterable={true}
          filterKeys={['nombres', 'apellidos', 'etapa', 'estado']}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Registro' : 'Nuevo Registro'}
      >
        <Form
          fields={fields}
          initialData={editingItem || {}}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={editingItem ? 'Actualizar' : 'Crear'}
          contenidoEditable={true}
          formatoData={!editingItem ? formatoData : null}
          contenidoTemplate={!editingItem && formatoData?.contenido ? formatoData.contenido : undefined}
        />
      </Modal>

      <Modal
        isOpen={isFormatoModalOpen}
        onClose={closeFormatoModal}
        title="Certificado de Catequesis"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Contenido
            </label>
            <textarea
              value={contenidoGenerado}
              onChange={handleFormatoChange}
              rows={15}
              className="w-full rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-3">
            <motion.button
              type="button"
              onClick={closeFormatoModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleGenerarFormato}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Generar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSaveFormato}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Guardar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleExportFormatoPDF}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Exportar PDF
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
