import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'nombre', label: 'Nombre del Grupo', required: true },
  { name: 'horario', label: 'Horario' },
  { name: 'salon', label: 'Salón' },
  { name: 'nivelId', label: 'Nivel', type: 'select', options: [] },
];

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'horario', label: 'Horario' },
  { key: 'salon', label: 'Salón' },
  { key: 'nivel', label: 'Nivel' },
];

export default function GruposPage() {
  return <CrudPage module="grupos" columns={columns} fields={fields} />;
}
