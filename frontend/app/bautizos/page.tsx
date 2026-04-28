'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import Table from '@/components/Table';
import { Modal, Form } from '@/components/Form';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { closeAlert, closeLoadingAlert, confirmDelete, errorAlert, loadingAlert, successAlert } from '@/lib/alerts';
import FirmanteSelector from '@/components/FirmanteSelector';
import { useFirmantes, type FirmanteOverrides } from '@/lib/useFirmantes';

const fields = [
  // Bautizado
  { name: 'nombres', label: 'Nombres', required: true, section: 'BAUTIZADO' },
  { name: 'apellidos', label: 'Apellidos', section: 'BAUTIZADO' },
  { name: 'fechaNacimiento', label: 'Fec. Nacimiento', type: 'date', section: 'BAUTIZADO' },
  {
    name: 'genero', label: 'Género', type: 'select', options: [
      { value: 'Masculino', label: 'Masculino' },
      { value: 'Femenino', label: 'Femenino' }
    ], section: 'BAUTIZADO'
  },
  { name: 'lugarNacimiento', label: 'Lugar Nacimiento', section: 'BAUTIZADO' },

  // Sacramento
  { name: 'fechaSacramento', label: 'Fecha Bautismo', type: 'date', required: true, section: 'SACRAMENTO' },
  { name: 'celebrante', label: 'Celebrante', section: 'SACRAMENTO' },

  // Padres
  { name: 'padre', label: 'Padre', required: true, section: 'PADRES' },
  { name: 'madre', label: 'Madre', required: true, section: 'PADRES' },

  // Abuelos
  { name: 'abueloPaterno', label: 'Abuelo Paterno', section: 'ABUELOS' },
  { name: 'abuelaPaterna', label: 'Abuela Paterna', section: 'ABUELOS' },
  { name: 'abueloMaterno', label: 'Abuelo Materno', section: 'ABUELOS' },
  { name: 'abuelaMaterna', label: 'Abuela Materna', section: 'ABUELOS' },

  // Padrinos
  { name: 'padrino', label: 'Padrino', section: 'PADRINOS' },
  { name: 'madrina', label: 'Madrina', section: 'PADRINOS' },

  // Registro
  { name: 'libro', label: 'Libro', required: true, section: 'REGISTRO' },
  { name: 'folio', label: 'Folio', required: true, section: 'REGISTRO' },
  { name: 'numero', label: 'Número', required: true, section: 'REGISTRO' },
  { name: 'doyFe', label: 'Doy Fe', section: 'REGISTRO' },

  { name: 'observaciones', label: 'Nota Marginal', type: 'textarea', section: 'NOTAS' },
];

const columns = [
  { key: 'nombres', label: 'Nombre' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'fechaSacramento', label: 'Fecha Bautismo' },
  { key: 'padre', label: 'Padre' },
  { key: 'madre', label: 'Madre' },
];

interface FormatoData {
  contenido: string;
  campos: Record<string, string>;
  tipo: string;
}

export default function BautizosPage() {
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
  const [isSavingFormato, setIsSavingFormato] = useState(false);
  const [isExportingFormato, setIsExportingFormato] = useState(false);

  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;
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
  } = useFirmantes(parroquiaId);
  const firmanteOverrides = useMemo<FirmanteOverrides>(() => ({
    quienFirma: selectedQuienFirma?.nombre,
    firmante: selectedFirmante?.nombre,
  }), [selectedQuienFirma, selectedFirmante]);

  useEffect(() => {
    loadData();
  }, [parroquiaId]);

  const loadData = async () => {
    if (!parroquiaId) return;
    setLoading(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroquiaId}/bautizos`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormatoContent = async () => {
    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=bautizos`);
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
    const nombreParroquia = usuario?.parroqusia || '';

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };

    const reemplazos: Record<string, string> = {
      libro: formData.libro || '',
      folio: formData.folio || '',
      numero: formData.numero || '',
      nombre: formData.nombres ? `${formData.nombres?.toUpperCase()} ${formData.apellidos?.toUpperCase() || ''}`.trim() : '',
      parroqui: nombreParroquia?.toUpperCase(),
      ciudadParroquia: usuario?.parroquiaCiudad?.toUpperCase() || '',
      direccionParroquia: usuario?.parroquiaDireccion || '',
      parroquiaconciudad: nombreParroquia?.toUpperCase() || '',
      telefonoParroquia: usuario?.parroquiaTelefono || '',
      fecha: formatDate(formData.fechaSacramento),
      ministro: formData.celebrante || '',
      tipobautizado: formData.genero === 'Femenino' ? 'una niña' : 'un niño',
      thijo: formData.genero === 'Femenino' ? 'Hija' : 'Hijo',
      tnacido: formData.genero === 'Femenino' ? 'Nacida' : 'Nacido',
      lugar_nacimiento: formData.lugarNacimiento || '',
      fecha_nacimiento: formatDate(formData.fechaNacimiento),
      legitimo: 'hijo',
      padres: formData.padre && formData.madre ? `de ${formData.padre} y ${formData.madre}` : '',
      abuelos_paternos: formData.abueloPaterno && formData.abuelaPaterna ? `${formData.abueloPaterno} y ${formData.abuelaPaterna}` : '',
      abuelos_maternos: formData.abueloMaterno && formData.abuelaMaterna ? `${formData.abueloMaterno} y ${formData.abuelaMaterna}` : '',
      padrinos: formData.padrino && formData.madrina ? `${formData.padrino} y ${formData.madrina}` : (formData.padrino || formData.madrina || ''),
      doyfe: formData.doyFe || '',
      marginal: formData.observaciones || 'SIN NOTA MARGINAL A LA FECHA.',
      quien_firma: overrides?.quienFirma?.toUpperCase() || formData.celebrante?.toUpperCase() || '',
      ministro_firma: overrides?.firmante || formData.celebrante || '',
      hoy: formatDate(new Date().toISOString()),
    };

    console.log(usuario)

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
        ? `/parroquias/${parroquiaId}/bautizos/${editingItem.id}`
        : `/parroquias/${parroquiaId}/bautizos`;

      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Bautizo actualizado' : 'Bautizo registrado');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminará este registro de bautismo');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroquiaId}/bautizos/${item.id}`, {
        method: 'DELETE',
      });

      closeAlert();
      loadData();
      successAlert('Bautizo eliminado');
    } catch (err) {
      closeAlert();
      errorAlert(err);
    }
  };

  const handleExport = async (item: any) => {
    if (!parroquiaId) return;

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroquiaId}/partidas/bautizos/${item.id}/pdf`,
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
      link.download = `partida-bautizo-${item.id}.pdf`;
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
      const response = await fetch(`/api/formatos?tipo=especial&modulo=bautizos`);
      const data = await response.json();

      // Primero usar contenidoEspecial guardado, luego generar desde template
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

  const handleExportRecordatorio = async (item: any) => {
    if (!parroquiaId) return;

    Swal.fire({
      title: 'Exportando...',
      text: 'Generando recordatorio PDF',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/partidas/bautizos/${item.id}/recordatorio-pdf`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error('No se pudo exportar el recordatorio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recordatorio-bautizo-${item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      Swal.close();
      successAlert('Recordatorio exportado');
    } catch (err) {
      Swal.close();
      errorAlert(err);
    }
  };

  const handleFormatoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContenidoGenerado(e.target.value);
  };

  const handleGenerarFormato = async () => {
    if (!formatoItem) return;

    try {
      const response = await fetch(`/api/formatos?tipo=especial&modulo=bautizos`);
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
    if (!parroquiaId || !formatoItem || isSavingFormato) return;

    setIsSavingFormato(true);
    loadingAlert('Guardando formato', 'Por favor espera...');

    try {
      const token = useAuthStore.getState().token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/bautizos/${formatoItem.id}`,
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
    if (!parroquiaId || !formatoItem || isExportingFormato) return;

    setIsExportingFormato(true);
    loadingAlert('Generando PDF', 'Por favor espera...');

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/parroquias/${parroquiaId}/partidas/bautizos/${formatoItem.id}/pdf-especial`,
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
      link.download = `partida-bautizo-${formatoItem.id}.pdf`;
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
          <h3 className="text-2xl font-bold">Gestión de Bautizos</h3>
          <p className="mt-1 text-sm text-white/85">Administra los registros de bautismo.</p>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('bautizos', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Bautizo
          </motion.button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          canEdit={can('bautizos', 'editar')}
          canDelete={can('bautizos', 'eliminar')}
          canExport={can('reportes', 'ver')}
          canExportEspecial={can('reportes', 'ver')}
          canExportRecordatorio={can('reportes', 'ver')}
          onEdit={openModal}
          onDelete={handleDelete}
          onExport={handleExport}
          onExportEspecial={handleExportEspecial}
          onExportRecordatorio={handleExportRecordatorio}
          filterable={true}
          filterKeys={['libro', 'folio', 'numero', 'nombres', 'apellidos']}
          filterLabels={{ libro: 'Libro', folio: 'Folio', numero: 'Numero', nombres: 'Nombres', apellidos: 'Apellidos' }}
          canExportData={true}
          exportFilename="bautizos"
          exportKeys={['nombres', 'apellidos', 'libro', 'folio', 'numero', 'fechaSacramento', 'padre', 'madre']}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Bautizo' : 'Nuevo Bautizo'}
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
