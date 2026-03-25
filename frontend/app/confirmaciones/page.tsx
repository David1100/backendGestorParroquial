'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';
import { confirmDelete, errorAlert, successAlert } from '@/lib/alerts';
import FirmanteSelector from '@/components/FirmanteSelector';
import { useFirmantes, type FirmanteOverrides } from '@/lib/useFirmantes';

const fields = [
  { name: 'nombres', label: 'Nombres', required: true, section: 'CONFIRMADO' },
  { name: 'apellidos', label: 'Apellidos', section: 'CONFIRMADO' },
  { name: 'fechaNacimiento', label: 'Fec. Nacimiento', type: 'date', section: 'CONFIRMADO' },
  { name: 'genero', label: 'Género', type: 'select', options: [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' }
  ], section: 'CONFIRMADO'},
  { name: 'lugarNacimiento', label: 'Lugar Nacimiento', section: 'CONFIRMADO' },
  
  { name: 'fechaSacramento', label: 'Fecha Confirmación', type: 'date', required: true, section: 'SACRAMENTO' },
  { name: 'celebrante', label: 'Celebrante', section: 'SACRAMENTO' },
  
  { name: 'padre', label: 'Padre', required: true, section: 'PADRES' },
  { name: 'madre', label: 'Madre', required: true, section: 'PADRES' },
  
  { name: 'tipoPadrino', label: 'Tipo', type: 'select', options: [
    { value: 'Padrino', label: 'Padrino' },
    { value: 'Madrina', label: 'Madrina' }
  ], section: 'PADRINOS' },
  { name: 'nombrePadrino', label: 'Nombre', section: 'PADRINOS' },
  { name: 'apellidoPadrino', label: 'Apellido', section: 'PADRINOS' },
  
  { name: 'bautismoParroquia', label: 'Parroquia Bautismo', section: 'BAUTISMO' },
  { name: 'bautismoLibro', label: 'Libro', section: 'BAUTISMO' },
  { name: 'bautismoFolio', label: 'Folio', section: 'BAUTISMO' },
  { name: 'bautismoNumero', label: 'Número', section: 'BAUTISMO' },
  { name: 'bautismoFecha', label: 'Fecha Bautismo', type: 'date', section: 'BAUTISMO' },
  
  { name: 'libro', label: 'Libro', required: true, section: 'REGISTRO' },
  { name: 'folio', label: 'Folio', required: true, section: 'REGISTRO' },
  { name: 'numero', label: 'Número', required: true, section: 'REGISTRO' },
  { name: 'doyFe', label: 'Doy Fe', section: 'REGISTRO' },
   
  { name: 'observaciones', label: 'Nota Marginal', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombres', label: 'Nombre' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'fechaSacramento', label: 'Fecha Confirmación' },
  { key: 'padre', label: 'Padre' },
  { key: 'madre', label: 'Madre' },
];

interface FormatoData {
  contenido: string;
  campos: Record<string, string>;
  tipo: string;
}

export default function ConfirmacionesPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formatoData, setFormatoData] = useState<FormatoData | null>(null);
  
  const [isFormatoModalOpen, setIsFormatoModalOpen] = useState(false);
  const [formatoItem, setFormatoItem] = useState<any>(null);
  const [contenidoGenerado, setContenidoGenerado] = useState('');

  const parroqusiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;
  const {
    quienesFirma,
    firmantes,
    loadingQuienesFirma,
    selectedQuienFirmaId,
    setSelectedQuienFirmaId,
    selectedFirmanteId,
    setSelectedFirmanteId,
    selectedQuienFirma,
    selectedFirmante,
  } = useFirmantes(parroqusiaId);
  const firmanteOverrides = useMemo<FirmanteOverrides>(() => ({
    quienFirma: selectedQuienFirma?.nombre,
    firmante: selectedFirmante?.nombre,
  }), [selectedQuienFirma, selectedFirmante]);

  useEffect(() => {
    loadData();
  }, [parroqusiaId]);

  const loadData = async () => {
    if (!parroqusiaId) return;
    setLoading(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/confirmaciones`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormatoContent = async () => {
    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=confirmaciones`);
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

  const generateContenidoEspecial = (formData: any, contenidoTemplate: string, overrides?: FirmanteOverrides) => {
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
      NOMBRE: formData.nombres ? `${formData.nombres?.toUpperCase()} ${formData.apellidos?.toUpperCase() || ''}`.trim() : '',
      parroquiaconciudad: nombreParroquia?.toUpperCase() || '',
      fecha: formatDate(formData.fechaSacramento),
      quien_firma: overrides?.quienFirma?.toUpperCase() || formData.celebrante?.toUpperCase() || '',
      ministro_firma: overrides?.firmante || formData.celebrante || '',
      tipoconfirmado: formData.genero === 'Femenino' ? 'una joven' : 'un joven',
      lugar_nacimiento: formData.lugarNacimiento || '',
      fecha_nacimiento: formatDate(formData.fechaNacimiento),
      legitimo: 'hij(a)',
      padres: formData.padre && formData.madre ? `de ${formData.padre} y ${formData.madre}` : '',
      tipo_padrino: formData.tipoPadrino || '',
      nombre_padrino: formData.nombrePadrino || '',
      apellido_padrino: formData.apellidoPadrino || '',
      bautismo_parroquia: formData.bautismoParroquia || '',
      bautismo_libro: formData.bautismoLibro || '',
      bautismo_folio: formData.bautismoFolio || '',
      bautismo_numero: formData.bautismoNumero || '',
      bautismo_fecha: formatDate(formData.bautismoFecha),
      padrinos: formData.nombrePadrino && formData.apellidoPadrino 
        ? `${formData.tipoPadrino || ''} ${formData.nombrePadrino} ${formData.apellidoPadrino}`.trim()
        : '',
      doyfe: formData.doyFe || '',
      marginal: formData.observaciones || 'Sin nota marginal a la fecha.',
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
        ? `/parroquias/${parroqusiaId}/confirmaciones/${editingItem.id}`
        : `/parroquias/${parroqusiaId}/confirmaciones`;
      
      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });
      
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Confirmación actualizada' : 'Confirmación registrada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminará este registro de confirmación');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroqusiaId}/confirmaciones/${item.id}`, {
        method: 'DELETE',
      });

      loadData();
      successAlert('Confirmación eliminada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleExport = async (item: any) => {
    if (!parroqusiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroqusiaId}/partidas/confirmaciones/${item.id}/pdf`,
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
      link.download = `partida-confirmacion-${item.id}.pdf`;
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
    if (!parroqusiaId) return;

    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=confirmaciones`);
      const data = await response.json();
      
      const contenidoGuardado = item.contenidoEspecial;
      
      if (contenidoGuardado) {
        setContenidoGenerado(contenidoGuardado);
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      } else if (data.contenido) {
        const contenido = generateContenidoEspecial(item, data.contenido, firmanteOverrides);
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
      const response = await fetch(`/api/formatos?tipo=especial&modulo=confirmaciones`);
      const data = await response.json();
      
      if (data.contenido) {
        const contenido = generateContenidoEspecial(formatoItem, data.contenido, firmanteOverrides);
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/confirmaciones/${formatoItem.id}`,
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
    if (!parroqusiaId || !formatoItem) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/partidas/confirmaciones/${formatoItem.id}/pdf-especial`,
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
      link.download = `partida-confirmacion-${formatoItem.id}.pdf`;
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold">Gestión de Confirmaciones</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros de confirmación.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('confirmaciones', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Confirmación
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {loading ? (
          <LoadingSpinner message="Cargando confirmaciones..." />
        ) : (
        <Table
          columns={columns}
          data={data}
          canEdit={can('confirmaciones', 'editar')}
          canDelete={can('confirmaciones', 'eliminar')}
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
        title={editingItem ? 'Editar Confirmación' : 'Nueva Confirmación'}
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
          <FirmanteSelector
            quienesFirma={quienesFirma}
            firmantes={firmantes}
            selectedQuienFirmaId={selectedQuienFirmaId}
            onSelectQuienFirma={setSelectedQuienFirmaId}
            selectedFirmanteId={selectedFirmanteId}
            onSelectFirmante={setSelectedFirmanteId}
            loading={loadingQuienesFirma}
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Contenido
            </label>
            <textarea
              value={contenidoGenerado}
              onChange={handleFormatoChange}
              rows={15}
              className="w-full rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 font-mono text-xs"
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
