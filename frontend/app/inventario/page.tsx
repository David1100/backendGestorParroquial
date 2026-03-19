import CrudPage from '@/components/CrudPage';

const fields = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'descripcion', label: 'Descripción' },
  { name: 'cantidad', label: 'Cantidad', type: 'number', required: true },
  { name: 'categoria', label: 'Categoría' },
  { name: 'ubicacion', label: 'Ubicación' },
];

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'ubicacion', label: 'Ubicación' },
];

export default function InventarioPage() {
  return <CrudPage module="inventario" columns={columns} fields={fields} />;
}
