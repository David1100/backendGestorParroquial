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
  // Datos del comunicano
  { name: 'nombres', label: 'Nombres', required: true, section: 'COMUNICO' },
  { name: 'apellidos', label: 'Apellidos', required: true, section: 'COMUNICO' },
  { name: 'fechaNacimiento', label: 'Fecha Nacimiento', type: 'date', required: true, section: 'COMUNICO' },
  { name: 'genero', label: 'Género', type: 'select', options: [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' }
  ], section: 'COMUNICO'},
  { name: 'lugarNacimiento', label: 'Lugar Nacimiento', section: 'COMUNICO' },
  
  // Sacramento
  { name: 'fechaSacramento', label: 'Fecha Comunión', type: 'date', required: true, section: 'SACRAMENTO' },
  { name: 'celebrante', label: 'Celebrante', section: 'SACRAMENTO' },
  
  // Padres
  { name: 'padre', label: 'Padre', required: true, section: 'PADRES' },
  { name: 'madre', label: 'Madre', required: true, section: 'PADRES' },
  
  // Información del Bautismo
  { name: 'bautizoParroquia', label: 'Parroquia Bautismo', section: 'BAUTISMO' },
  { name: 'bautizoLibro', label: 'Libro', section: 'BAUTISMO' },
  { name: 'bautizoFolio', label: 'Folio', section: 'BAUTISMO' },
  { name: 'bautizoNumero', label: 'Número', section: 'BAUTISMO' },
  { name: 'bautizoFecha', label: 'Fecha Bautismo', type: 'date', section: 'BAUTISMO' },
  
  // Padrinos/Madrinas
  { name: 'tipoPadrino', label: 'Tipo', type: 'select', options: [
    { value: 'Padrino', label: 'Padrino' },
    { value: 'Madrina', label: 'Madrina' },
    { value: 'Padrinos', label: 'Padrinos' },
  ], section: 'PADRINOS' },
  { name: 'nombrePadrino', label: 'Nombre Padrino/Madrina', section: 'PADRINOS' },
  { name: 'doyFePadrino', label: 'Doy Fe', section: 'PADRINOS' },
  
  // Registro
  { name: 'libro', label: 'Libro', required: true, section: 'REGISTRO' },
  { name: 'folio', label: 'Folio', required: true, section: 'REGISTRO' },
  { name: 'numero', label: 'Número', required: true, section: 'REGISTRO' },
  
  { name: 'observaciones', label: 'Observaciones', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombres', label: 'Nombre' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'fechaSacramento', label: 'Fecha Comunión' },
  { key: 'padre', label: 'Padre' },
  { key: 'madre', label: 'Madre' },
];

interface FormatoData {
  contenido: string;
  campos: Record<string, string>;
  tipo: string;
}

export default function ComunionesPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formatoData, setFormatoData] = useState<FormatoData | null>(null);
  
  // Modal de formato especial
  const [isFormatoModalOpen, setIsFormatoModalOpen] = useState(false);
  const [formatoItem, setFormatoItem] = useState<any>(null);
  const [contenidoGenerado, setContenidoGenerado] = useState('');

  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadData();
  }, [parroquiaId]);

  const loadData = async () => {
    if (!parroquiaId) return;
    setLoading(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroquiaId}/comuniones`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormatoContent = async () => {
    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=comuniones`);
      const data = await response.json();
      if (data.contenido) {
        setFormatoData({ contenido: data.contenido, campos: data.campos, tipo: 'especial' });
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
      libro: formData.libro || '',
      folio: formData.folio || '',
      numero: formData.numero || '',
      nombre: formData.nombres ? `${formData.nombres} ${formData.apellidos || ''}`.trim() : '',
      parroqui: nombreParroquia,
      parroquiaconciudad: nombreParroquia || '',
      fecha: formatDate(formData.fechaSacramento),
      ministro: formData.celebrante || '',
      lugar_nacimiento: formData.lugarNacimiento || '',
      fecha_nacimiento: formatDate(formData.fechaNacimiento),
      padres: formData.padre && formData.madre ? `de ${formData.padre} y ${formData.madre}` : '',
      bautizo_parroquia: formData.bautizoParroquia || '',
      bautizo_libro: formData.bautizoLibro || '',
      bautizo_folio: formData.bautizoFolio || '',
      bautizo_numero: formData.bautizoNumero || '',
      bautizo_fecha: formatDate(formData.bautizoFecha),
      tipo_padrino: formData.tipoPadrino || '',
      padrinos: formData.nombrePadrino || '',
      doyfe: formData.doyFePadrino || '',
      quien_firma: formData.celebrante || '',
      ministro_firma: formData.celebrante || '',
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
    if (!parroquiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    try {
      const payload = buildPayload(formData);
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `/parroquias/${parroquiaId}/comuniones/${editingItem.id}`
        : `/parroquias/${parroquiaId}/comuniones`;
      
      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });
      
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Comunión actualizada' : 'Comunión registrada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminará este registro de comunión');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/comuniones/${item.id}`, {
        method: 'DELETE',
      });

      loadData();
      successAlert('Comunión eliminada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleExport = async (item: any) => {
    if (!parroquiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/partidas/comuniones/${item.id}/pdf`,
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
      link.download = `partida-comunion-${item.id}.pdf`;
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
    if (!parroquiaId) return;

    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=comuniones`);
      const data = await response.json();
      
      const contenidoGuardado = item.contenidoEspecial;
      
      if (contenidoGuardado) {
        setContenidoGenerado(contenidoGuardado);
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      } else if (data.contenido) {
        const contenido = generateContenidoEspecial(item, data.contenido);
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
      const response = await fetch(`/api/formatos?tipo=especial&modulo=comuniones`);
      const data = await response.json();
      
      if (data.contenido) {
        const contenido = generateContenidoEspecial(formatoItem, data.contenido);
        setContenidoGenerado(contenido);
      }
    } catch (err) {
      console.error('Error generando formato:', err);
    }
  };

  const handleSaveFormato = async () => {
    if (!parroquiaId || !formatoItem) return;

    try {
      const token = useAuthStore.getState().token;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/comuniones/${formatoItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            contenidoEspecial: contenidoGenerado,
            tipoFormato: 'especial'
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al guardar');
      }

      loadData();
      successAlert('Formato guardado');
      setIsFormatoModalOpen(false);
    } catch (err: any) {
      console.error('Error guardando:', err);
      errorAlert(err);
    }
  };

  const handleExportFormatoPDF = async () => {
    if (!parroquiaId || !formatoItem) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/partidas/comuniones/${formatoItem.id}/pdf-especial`,
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
      link.download = `partida-comunion-${formatoItem.id}.pdf`;
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold">Gestión de Comuniones</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros de primera comunión.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('comuniones', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Comunión
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {loading ? (
          <LoadingSpinner message="Cargando comuniones..." />
        ) : (
        <Table
          columns={columns}
          data={data}
          canEdit={can('comuniones', 'editar')}
          canDelete={can('comuniones', 'eliminar')}
          canExport={can('reportes', 'ver')}
          canExportEspecial={can('reportes', 'ver')}
          onEdit={openModal}
          onDelete={handleDelete}
          onExport={handleExport}
          onExportEspecial={handleExportEspecial}
          filterable={true}
          filterKeys={['libro', 'folio', 'numero', 'nombres', 'apellidos']}
        />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Comunión' : 'Nueva Comunión'}
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
        title="Formato de Partida"
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
              className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-3">
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
              onClick={closeFormatoModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
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
