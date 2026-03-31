import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'nombre', label: 'Nombre del Catequista', required: true },
  { name: 'telefono', label: 'Teléfono' },
  { name: 'email', label: 'Correo electrónico' },
  { name: 'fechaInicio', label: 'Fecha de Inicio', type: 'date' },
  { name: 'capacitaciones', label: 'Capacitaciones' },
  { name: 'observaciones', label: 'Observaciones' },
];

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
];

export default function CatequistasPage() {
  return <CrudPage module="catequistas" columns={columns} fields={fields} />;
}
