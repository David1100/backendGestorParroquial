import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'sacerdote', label: 'Sacerdote', required: true },
  { name: 'feligres', label: 'Feligres', required: true },
  { name: 'telefono', label: 'Telefono' },
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
  { name: 'observacion', label: 'Observacion' },
];

const columns = [
  { key: 'sacerdote', label: 'Sacerdote' },
  { key: 'feligres', label: 'Feligres' },
  { key: 'fechaHora', label: 'Fecha' },
  { key: 'estado', label: 'Estado' },
];

export default function CitasPage() {
  return <CrudPage module="citas" columns={columns} fields={fields} />;
}
