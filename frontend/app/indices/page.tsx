'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import Table from '@/components/Table';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { errorAlert } from '@/lib/alerts';

const SACRAMENTOS = [
  { value: 'bautismo', label: 'Bautismo' },
  { value: 'confirmacion', label: 'Confirmacion' },
  { value: 'matrimonio', label: 'Matrimonio' },
  { value: 'defuncion', label: 'Defuncion' },
];

const columns = [
  { key: 'libro', label: 'Libro' },
  { key: 'folio', label: 'Folio' },
  { key: 'numero', label: 'Numero' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'fecha', label: 'Fecha' },
];

export default function IndicesPage() {
  const { usuario, can } = useAuthStore();
  const [sacramento, setSacramento] = useState('bautismo');
  const [delLibro, setDelLibro] = useState('');
  const [alLibro, setAlLibro] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [resumen, setResumen] = useState<{ total: number; sacramento: string } | null>(null);

  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  const consultar = async (event: FormEvent) => {
    event.preventDefault();

    if (!parroquiaId) {
      errorAlert(new Error('No se encontro la parroquia activa'));
      return;
    }

    const from = Number(delLibro);
    const to = Number(alLibro);

    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      errorAlert(new Error('Del libro y al libro deben ser numeros enteros'));
      return;
    }

    if (from > to) {
      errorAlert(new Error('El rango de libros es invalido'));
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        sacramento,
        delLibro: String(from),
        alLibro: String(to),
      });
      const response = await fetchAPI(`/parroquias/${parroquiaId}/reportes/indices?${params.toString()}`);
      const data = Array.isArray(response?.data) ? response.data : [];
      setResultados(data);
      setResumen({ total: Number(response?.total || 0), sacramento: response?.sacramento || '' });
    } catch (err) {
      errorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  if (!can('indices', 'ver')) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
        No tiene acceso al modulo de indices.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-sky-500 p-6 text-white"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <h3 className="text-2xl font-bold">Indice de Libros</h3>
          <p className="mt-1 text-sm text-white/90">Seleccione el sacramento y el rango numerico de libros.</p>
        </div>
      </motion.section>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <form onSubmit={consultar} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Libro del Sacramento</label>
            <select
              value={sacramento}
              onChange={(e) => setSacramento(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {SACRAMENTOS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Del libro</label>
            <input
              type="number"
              value={delLibro}
              onChange={(e) => setDelLibro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Ej: 1"
              min={1}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Al libro</label>
            <input
              type="number"
              value={alLibro}
              onChange={(e) => setAlLibro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="Ej: 10"
              min={1}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDelLibro('');
                setAlLibro('');
                setResultados([]);
                setResumen(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {resumen && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <span className="font-semibold">{resumen.total}</span> registros encontrados para <span className="font-semibold">{resumen.sacramento}</span>.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Table columns={columns} data={resultados} loading={loading} />
      </div>
    </div>
  );
}
