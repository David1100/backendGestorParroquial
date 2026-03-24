'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
