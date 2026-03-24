'use client';

import { motion } from 'framer-motion';

interface SkeletonCardProps {
  count?: number;
}

export default function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-2xl shadow-sm p-6"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-slate-100">
              <div className="h-8 w-8 bg-slate-200 rounded" />
            </div>
            <div className="h-8 w-12 bg-slate-200 rounded" />
          </div>
          <div className="mt-4 h-5 w-24 bg-slate-200 rounded" />
          <div className="mt-3 h-4 w-16 bg-slate-100 rounded" />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </th>
              ))}
              <th className="px-6 py-4 text-right">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
