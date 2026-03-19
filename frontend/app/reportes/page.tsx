'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';

const cards = [
  { key: 'bautizos', label: 'Bautizos', tone: 'from-sky-500 to-cyan-500' },
  { key: 'comuniones', label: 'Comuniones', tone: 'from-emerald-500 to-teal-500' },
  { key: 'confirmaciones', label: 'Confirmaciones', tone: 'from-violet-500 to-indigo-500' },
  { key: 'matrimonios', label: 'Matrimonios', tone: 'from-rose-500 to-pink-500' },
  { key: 'difuntos', label: 'Difuntos', tone: 'from-slate-500 to-slate-700' },
  { key: 'catequesis', label: 'Catequesis', tone: 'from-amber-500 to-orange-500' },
  { key: 'totalDonaciones', label: 'Total Donaciones', tone: 'from-emerald-500 to-teal-500', currency: true },
];

export default function ReportesPage() {
  const { usuario, can } = useAuthStore();
  const [reportes, setReportes] = useState<any>(null);
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    if (can('reportes', 'ver') && parroquiaId) {
      fetchAPI(`/parroquias/${parroquiaId}/reportes`)
        .then(setReportes)
        .catch(console.error);
    }
  }, [parroquiaId]);

  if (!can('reportes', 'ver')) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
        No tiene acceso a reportes.
      </div>
    );
  }

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
          <h3 className="text-2xl font-bold">Resumen de Reportes</h3>
          <p className="mt-1 text-sm text-white/85">Visor general de sacramentos, actividad y donaciones.</p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const value = reportes?.[card.key] || 0;
          const text = card.currency ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString();

          return (
            <motion.article
              key={card.key}
              className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`} />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">{text}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
