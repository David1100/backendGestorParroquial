'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { Modal, Form } from '@/components/Form';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { confirmDelete, closeAlert, errorAlert, successAlert } from '@/lib/alerts';

const fields = [
  { name: 'sacerdote', label: 'Sacerdote', required: true },
  { name: 'feligres', label: 'Feligrés', required: true },
  { name: 'telefono', label: 'Teléfono' },
  { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
  { name: 'motivo', label: 'Motivo', required: true },
  {
    name: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'confirmada', label: 'Confirmada' },
      { value: 'cancelada', label: 'Cancelada' },
      { value: 'atendida', label: 'Atendida' },
    ],
    required: true,
  },
  { name: 'observacion', label: 'Observación', type: 'textarea' },
];

const ESTADO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  confirmada: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  cancelada: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  atendida: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
};

export default function CitasPage() {
  const { usuario, can } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const calendarRef = useRef<any>(null);

  const parroqusiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    loadData();
  }, [parroqusiaId]);

  const loadData = async () => {
    if (!parroqusiaId) return;
    setLoading(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroqusiaId}/citas`);
      setData(result);
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (formData: any) => {
    const payload: Record<string, any> = {};

    for (const field of fields) {
      const rawValue = formData?.[field.name];

      if (rawValue === undefined || rawValue === '') {
        payload[field.name] = null;
        continue;
      }

      if (field.type === 'datetime-local') {
        const parsedDateTime = new Date(rawValue);
        payload[field.name] = Number.isNaN(parsedDateTime.getTime()) ? null : parsedDateTime.toISOString();
        continue;
      }

      payload[field.name] = rawValue;
    }

    return payload;
  };

  const handleSubmit = async (formData: any) => {
    if (!parroqusiaId) {
      errorAlert(new Error('No se encontró la parroquia activa'));
      return;
    }

    try {
      const payload = buildPayload(formData);
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `/parroquias/${parroqusiaId}/citas/${editingItem.id}`
        : `/parroquias/${parroqusiaId}/citas`;

      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      successAlert(editingItem ? 'Cita actualizada' : 'Cita creada');
    } catch (err) {
      errorAlert(err);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirmDelete('Se eliminará esta cita');
    if (!ok) return;

    try {
      await fetchAPI(`/parroquias/${parroqusiaId}/citas/${item.id}`, {
        method: 'DELETE',
      });

      closeAlert();
      loadData();
      successAlert('Cita eliminada');
    } catch (err) {
      closeAlert();
      errorAlert(err);
    }
  };

  const openModal = (item?: any, date?: Date) => {
    setEditingItem(item || null);
    if (date) {
      setSelectedDate(date);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const openDetailModal = (cita: any) => {
    setSelectedCita(cita);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCita(null);
  };

  const getInitialData = () => {
    if (editingItem) {
      return editingItem;
    }
    return {
      fechaHora: selectedDate.toISOString().slice(0, 16),
    };
  };

  const formatTime = (fechaHora: string) => {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const events = data.map((cita) => {
    const colors = ESTADO_COLORS[cita.estado] || ESTADO_COLORS.pendiente;
    return {
      id: cita.id,
      title: `${cita.feligres} - ${cita.motivo}`,
      start: cita.fechaHora,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        cita,
      },
    };
  });

  const handleEventClick = (info: any) => {
    openDetailModal(info.event.extendedProps.cita);
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date);
    openModal(undefined, clickedDate);
  };

  return (
    <div className="space-y-6">
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-400 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Gestión de Citas</h3>
            <p className="mt-1 text-sm text-white/85">Administra las citas parroquiales.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </motion.section>

      <div className="flex justify-end">
        {can('citas', 'crear') && (
          <motion.button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-purple-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </motion.button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando citas..." />
      ) : viewMode === 'calendar' ? (
        <motion.div
          className="rounded-2xl bg-white p-4 shadow-lg border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            locale="es"
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              prev: '<',
              next: '>',
            }}
            eventDisplay="block"
            height="auto"
            aspectRatio={1.8}
          />
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay citas programadas</p>
          ) : (
            data
              .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
              .map((cita) => (
                <motion.div
                  key={cita.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openDetailModal(cita)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{cita.feligres}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} - {formatTime(cita.fechaHora)}
                        </span>
                        <span className="text-xs text-gray-400">{cita.motivo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium`}
                      style={{
                        backgroundColor: ESTADO_COLORS[cita.estado]?.bg || '#f3f4f6',
                        color: ESTADO_COLORS[cita.estado]?.text || '#374151',
                      }}
                    >
                      {cita.estado}
                    </span>
                    {can('citas', 'editar') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(cita);
                        }}
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    {can('citas', 'eliminar') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cita);
                        }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Cita' : 'Nueva Cita'}
      >
        <Form
          fields={fields}
          initialData={getInitialData()}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={editingItem ? 'Actualizar' : 'Crear'}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="Detalles de la Cita"
      >
        {selectedCita && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Feligrés</label>
                <p className="text-sm font-medium text-gray-900">{selectedCita.feligres}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Sacerdote</label>
                <p className="text-sm font-medium text-gray-900">{selectedCita.sacerdote}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Teléfono</label>
                <p className="text-sm text-gray-900">{selectedCita.telefono || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Fecha/Hora</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCita.fechaHora).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  {formatTime(selectedCita.fechaHora)}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Motivo</label>
                <p className="text-sm text-gray-900">{selectedCita.motivo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Estado</label>
                <span
                  className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: ESTADO_COLORS[selectedCita.estado]?.bg || '#f3f4f6',
                    color: ESTADO_COLORS[selectedCita.estado]?.text || '#374151',
                  }}
                >
                  {selectedCita.estado}
                </span>
              </div>
              {selectedCita.observacion && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Observación</label>
                  <p className="text-sm text-gray-900">{selectedCita.observacion}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={closeDetailModal}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  closeDetailModal();
                  openModal(selectedCita);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Editar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
