'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import { closeLoadingAlert, confirmDelete, errorAlert, loadingAlert, successAlert } from '@/lib/alerts';
import FirmanteSelector from '@/components/FirmanteSelector';
import { useFirmantes, type FirmanteOverrides } from '@/lib/useFirmantes';

const fields = [
  { name: 'nombreNovio', label: 'Nombre(s)', required: true, section: 'NOVIO' },
  { name: 'apellidoNovio', label: 'Apellido(s)', section: 'NOVIO' },
  { name: 'fechaNacimientoNovio', label: 'Fec. Nacimiento', type: 'date', section: 'NOVIO' },
  { name: 'lugarNacimientoNovio', label: 'Lugar Nacimiento', section: 'NOVIO' },
  { name: 'fechaBautismoNovio', label: 'Fec. Bautizo', type: 'date', section: 'NOVIO' },
  { name: 'lugarBautismoNovio', label: 'Lugar Bautizo', section: 'NOVIO' },
  { name: 'bautismoLibroNovio', label: 'Libro Bautizo', section: 'NOVIO' },
  { name: 'bautismoFolioNovio', label: 'Folio Bautizo', section: 'NOVIO' },
  { name: 'bautismoNumeroNovio', label: 'Número Bautizo', section: 'NOVIO' },
  { name: 'padreNovio', label: 'Nombre del Padre', section: 'NOVIO' },
  { name: 'madreNovio', label: 'Nombre de la Madre', section: 'NOVIO' },

  { name: 'nombreNovia', label: 'Nombre(s)', required: true, section: 'NOVIA' },
  { name: 'apellidoNovia', label: 'Apellido(s)', section: 'NOVIA' },
  { name: 'fechaNacimientoNovia', label: 'Fec. Nacimiento', type: 'date', section: 'NOVIA' },
  { name: 'lugarNacimientoNovia', label: 'Lugar Nacimiento', section: 'NOVIA' },
  { name: 'fechaBautismoNovia', label: 'Fec. Bautizo', type: 'date', section: 'NOVIA' },
  { name: 'lugarBautismoNovia', label: 'Lugar Bautizo', section: 'NOVIA' },
  { name: 'bautismoLibroNovia', label: 'Libro Bautizo', section: 'NOVIA' },
  { name: 'bautismoFolioNovia', label: 'Folio Bautizo', section: 'NOVIA' },
  { name: 'bautismoNumeroNovia', label: 'Número Bautizo', section: 'NOVIA' },
  { name: 'padreNovia', label: 'Nombre del Padre', section: 'NOVIA' },
  { name: 'madreNovia', label: 'Nombre de la Madre', section: 'NOVIA' },

  { name: 'fecha', label: 'Fecha Matrimonio', type: 'date', required: true, section: 'SACRAMENTO' },
  { name: 'celebrante', label: 'Celebrante', section: 'SACRAMENTO' },
  { name: 'proclamas', label: 'Proclamas', type: 'textarea', section: 'SACRAMENTO' },

  { name: 'testigo1Nombre', label: 'Nombre Testigo 1', section: 'TESTIGOS' },
  { name: 'testigo1Apellido', label: 'Apellido Testigo 1', section: 'TESTIGOS' },
  { name: 'testigo2Nombre', label: 'Nombre Testigo 2', section: 'TESTIGOS' },
  { name: 'testigo2Apellido', label: 'Apellido Testigo 2', section: 'TESTIGOS' },
  { name: 'testigo3Nombre', label: 'Nombre Testigo 3', section: 'TESTIGOS' },
  { name: 'testigo3Apellido', label: 'Apellido Testigo 3', section: 'TESTIGOS' },
  { name: 'testigo4Nombre', label: 'Nombre Testigo 4', section: 'TESTIGOS' },
  { name: 'testigo4Apellido', label: 'Apellido Testigo 4', section: 'TESTIGOS' },

  { name: 'libro', label: 'Libro', required: true, section: 'REGISTRO' },
  { name: 'folio', label: 'Folio', required: true, section: 'REGISTRO' },
  { name: 'numero', label: 'Número', required: true, section: 'REGISTRO' },
  { name: 'doyFe', label: 'Doy Fe', section: 'REGISTRO' },

  { name: 'observaciones', label: 'Nota Marginal', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombreNovio', label: 'Novio' },
  { key: 'apellidoNovio', label: 'Apellido Novio' },
  { key: 'nombreNovia', label: 'Novia' },
  { key: 'apellidoNovia', label: 'Apellido Novia' },
  { key: 'fecha', label: 'Fecha' },
];

interface FormatoData {
  contenido: string;
  campos: Record<string, string>;
  tipo: string;
}

export default function MatrimoniosPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formatoData, setFormatoData] = useState<FormatoData | null>(null);

  const [isFormatoModalOpen, setIsFormatoModalOpen] = useState(false);
  const [formatoItem, setFormatoItem] = useState<any>(null);
  const [contenidoGenerado, setContenidoGenerado] = useState('');
  const [isSavingFormato, setIsSavingFormato] = useState(false);
  const [isExportingFormato, setIsExportingFormato] = useState(false);

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
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/matrimonios`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormatoContent = async () => {
    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=matrimonios`);
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

  const generateContenidoEspecial = (formData: any, contenidoTemplate: string, overrides?: FirmanteOverrides) => {
    let contenido = contenidoTemplate;

    const nombreParroquia = usuario?.parroqusia || '';

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} del ${year}`;
    };

    const buildTestigos = () => {
      const testigos: string[] = [];
      for (let i = 1; i <= 4; i++) {
        const nombre = formData[`testigo${i}Nombre`];
        const apellido = formData[`testigo${i}Apellido`];
        if (nombre || apellido) {
          testigos.push(`${nombre || ''} ${apellido || ''}`.trim());
        }
      }
      return testigos.length > 0 ? testigos.join(', ') : '';
    };

    const reemplazos: Record<string, string> = {
      libro: formData.libro || '',
      folio: formData.folio || '',
      numero: formData.numero || '',
      parroquiaconciudad: nombreParroquia?.toUpperCase() || '',
      ciudadParroquia: usuario?.parroquiaCiudad || '',
      direccionParroquia: usuario?.parroquiaDireccion || '',
      fecha: formatDate(formData.fecha),
      quien_firma: overrides?.quienFirma?.toUpperCase() || formData.celebrante?.toUpperCase() || '',
      ministro_firma: overrides?.firmante || formData.celebrante || '',
      nombre_novio: formData.nombreNovio?.toUpperCase() || '',
      apellido_novio: formData.apellidoNovio?.toUpperCase() || '',
      NOMBRE_NOVIO: formData.nombreNovio?.toUpperCase() || '',
      APELLIDO_NOVIO: formData.apellidoNovio?.toUpperCase() || '',
      nombre_novia: formData.nombreNovia?.toUpperCase() || '',
      apellido_novia: formData.apellidoNovia?.toUpperCase() || '',
      NOMBRE_NOVIA: formData.nombreNovia?.toUpperCase() || '',
      APELLIDO_NOVIA: formData.apellidoNovia?.toUpperCase() || '',
      lugar_nacimiento_novio: formData.lugarNacimientoNovio || '',
      fecha_nacimiento_novio: formatDate(formData.fechaNacimientoNovio),
      lugar_nacimiento_novia: formData.lugarNacimientoNovia || '',
      fecha_nacimiento_novia: formatDate(formData.fechaNacimientoNovia),
      padre_novio: formData.padreNovio || '',
      madre_novio: formData.madreNovio || '',
      padre_novia: formData.padreNovia || '',
      madre_novia: formData.madreNovia || '',
      lugar_bautismo_novio: formData.lugarBautismoNovio || '',
      fecha_bautismo_novio: formatDate(formData.fechaBautismoNovio),
      lugar_bautismo_novia: formData.lugarBautismoNovia || '',
      fecha_bautismo_novia: formatDate(formData.fechaBautismoNovia),
      bautismo_libro_novio: formData.bautismoLibroNovio || '',
      bautismo_folio_novio: formData.bautismoFolioNovio || '',
      bautismo_numero_novio: formData.bautismoNumeroNovio || '',
      bautismo_libro_novia: formData.bautismoLibroNovia || '',
      bautismo_folio_novia: formData.bautismoFolioNovia || '',
      bautismo_numero_novia: formData.bautismoNumeroNovia || '',
      testigos: buildTestigos(),
      proclamas: formData.proclamas || '',
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
        ? `/parroquias/${parroqusiaId}/matrimonios/${editingItem.id}`
        : `/parroquias/${parroqusiaId}/matrimonios`;

      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Matrimonio actualizado' : 'Matrimonio registrado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminara este registro de matrimonio');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroqusiaId}/matrimonios/${item.id}`, {
        method: 'DELETE',
      });

      loadData();
      successAlert('Matrimonio eliminado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleExport = async (item: any) => {
    if (!parroqusiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroqusiaId}/partidas/matrimonios/${item.id}/pdf`,
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
      link.download = `partida-matrimonio-${item.id}.pdf`;
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
      const response = await fetch(`/api/formatos?tipo=especial&modulo=matrimonios`);
      const result = await response.json();

      const contenidoGuardado = item.contenidoEspecial;

      if (contenidoGuardado) {
        setContenidoGenerado(contenidoGuardado);
        setFormatoItem(item);
        setIsFormatoModalOpen(true);
      } else if (result.contenido) {
        const contenido = generateContenidoEspecial(item, result.contenido, firmanteOverrides);
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
      const response = await fetch(`/api/formatos?tipo=especial&modulo=matrimonios`);
      const result = await response.json();

      if (result.contenido) {
        const contenido = generateContenidoEspecial(formatoItem, result.contenido, firmanteOverrides);
        setContenidoGenerado(contenido);
      }
    } catch (err) {
      console.error('Error generando formato:', err);
    }
  };

  const handleSaveFormato = async () => {
    if (!parroqusiaId || !formatoItem || isSavingFormato) return;

    setIsSavingFormato(true);
    loadingAlert('Guardando formato', 'Por favor espera...');

    try {
      const token = useAuthStore.getState().token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/matrimonios/${formatoItem.id}`,
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
      closeLoadingAlert();
      successAlert('Formato guardado');
      setIsFormatoModalOpen(false);
    } catch (err: any) {
      console.error('Error guardando:', err);
      closeLoadingAlert();
      errorAlert(err);
    } finally {
      setIsSavingFormato(false);
    }
  };

  const handleExportFormatoPDF = async () => {
    if (!parroqusiaId || !formatoItem || isExportingFormato) return;

    setIsExportingFormato(true);
    loadingAlert('Generando PDF', 'Por favor espera...');

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroqusiaId}/partidas/matrimonios/${formatoItem.id}/pdf-especial`,
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
      link.download = `partida-matrimonio-${formatoItem.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      closeLoadingAlert();
      successAlert('PDF exportado');
    } catch (err) {
      closeLoadingAlert();
      errorAlert(err);
    } finally {
      setIsExportingFormato(false);
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold">Gestion de Matrimonios</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros de matrimonio.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('matrimonios', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Matrimonio
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          canEdit={can('matrimonios', 'editar')}
          canDelete={can('matrimonios', 'eliminar')}
          canExport={can('reportes', 'ver')}
          canExportEspecial={can('reportes', 'ver')}
          onEdit={openModal}
          onDelete={handleDelete}
          onExport={handleExport}
          onExportEspecial={handleExportEspecial}
          filterable={true}
          filterKeys={['libro', 'folio', 'numero', 'nombreNovio', 'apellidoNovio', 'nombreNovia', 'apellidoNovia']}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Matrimonio' : 'Nuevo Matrimonio'}
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
              className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-mono text-xs"
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
              disabled={isSavingFormato}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSavingFormato ? 'Guardando...' : 'Guardar'}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleExportFormatoPDF}
              disabled={isExportingFormato}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isExportingFormato ? 'Exportando...' : 'Exportar PDF'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
