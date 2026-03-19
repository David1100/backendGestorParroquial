import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'documento', label: 'Documento' },
  { name: 'fecha', label: 'Fecha', type: 'date', required: true },
  { name: 'monto', label: 'Monto', type: 'number', required: true },
  { name: 'concepto', label: 'Concepto' },
  { name: 'tipo', label: 'Tipo', required: true },
];

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'monto', label: 'Monto' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'fecha', label: 'Fecha' },
];

export default function DonacionesPage() {
  return <CrudPage module="donaciones" columns={columns} fields={fields} />;
}
