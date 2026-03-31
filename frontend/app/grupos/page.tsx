import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'nombre', label: 'Nombre del Grupo', required: true },
  { name: 'detalle', label: 'Detalle', type: 'textarea' },
];

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'detalle', label: 'Detalle' },
];

export default function GruposPage() {
  return <CrudPage module="grupos" columns={columns} fields={fields} />;
}
