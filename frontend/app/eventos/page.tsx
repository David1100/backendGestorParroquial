import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'titulo', label: 'Título', required: true },
  { name: 'descripcion', label: 'Descripción' },
  { name: 'fechaInicio', label: 'Fecha Inicio', type: 'date', required: true },
  { name: 'fechaFin', label: 'Fecha Fin', type: 'date' },
  { name: 'lugar', label: 'Lugar' },
];

const columns = [
  { key: 'titulo', label: 'Título' },
  { key: 'fechaInicio', label: 'Inicio' },
  { key: 'lugar', label: 'Lugar' },
];

export default function EventosPage() {
  return <CrudPage module="eventos" columns={columns} fields={fields} />;
}
