'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormatoEspecialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
}

const DEFAULT_CONTENT = `ACTA DE BAUTISMO

En la ciudad de _____________, a los ______ días del mes de ____________ del año ____________, 
el sacerdote _________________________________, de esta Parish _________________________________, 
Bautizó solemnemente a:

Nombre del bautizado: ________________________________________________
Fecha de nacimiento: ________________________________________________
Lugar de nacimiento: ________________________________________________
Nombre del padre: ________________________________________________
Nombre de la madre: ________________________________________________

Abuelos paternos: ________________________________________________
Abuelos maternos: ________________________________________________

Padrino: ________________________________________________
Madrina: ________________________________________________

Doy fe: ________________________________________________

Libro: _________________    Folio: _________________    Número: _________________

Observaciones: ________________________________________________

_________________________
Firma del sacerdote`;

export default function FormatoEspecialModal({ isOpen, onClose, onSave, initialContent }: FormatoEspecialModalProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_CONTENT);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || DEFAULT_CONTENT);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Formato de Bautismo Especial</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Edite el contenido especial para la partida de bautismo. Este contenido se utilizará cuando exporte la nota marginal.
            </p>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4 h-96 w-full rounded-xl border border-slate-200 p-4 font-mono text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Escriba el contenido especial aquí..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40"
              >
                Guardar Contenido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
