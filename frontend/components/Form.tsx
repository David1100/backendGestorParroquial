'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center justify-between border-b border-indigo-100 px-6 py-4">
              <motion.h3 
                className="text-xl font-bold text-slate-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>
              <motion.button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FormField {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  section?: string;
}

interface FormProps {
  fields: FormField[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitLabel?: string;
  onChange?: (name: string, value: any) => void;
  contenidoEditable?: boolean;
  formatoData?: {
    contenido: string;
    campos: Record<string, string>;
    tipo: string;
  } | null;
  onFormChange?: (formData: any) => void;
  contenidoTemplate?: string;
  simple?: boolean;
}

export function Form({ fields, initialData, onSubmit, onCancel, submitLabel = 'Guardar', onChange, contenidoEditable = false, formatoData, onFormChange, contenidoTemplate, simple = false }: FormProps) {
  const normalizeInitialData = (data?: any) => {
    if (!data) {
      return {};
    }

    const normalized = { ...data };

    for (const field of fields) {
      const value = data[field.name];
      if (!value) {
        continue;
      }

      if (field.type === 'date') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
          normalized[field.name] = parsed.toISOString().slice(0, 10);
        }
      }

      if (field.type === 'datetime-local') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
          const localTime = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          normalized[field.name] = localTime;
        }
      }
    }

    return normalized;
  };

  const [formData, setFormData] = useState<any>(() => normalizeInitialData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(normalizeInitialData(initialData));
  }, [initialData]);

  useEffect(() => {
    if (initialData?.contenidoEspecial && !formData?.contenidoEspecial) {
      setFormData((prev: any) => ({ ...prev, contenidoEspecial: initialData.contenidoEspecial }));
    }
  }, [initialData?.contenidoEspecial]);

  useEffect(() => {
    if (formatoData) {
      const nuevosCampos: Record<string, any> = {};
      
      if (formatoData.campos) {
        for (const [key, value] of Object.entries(formatoData.campos)) {
          nuevosCampos[key] = value;
        }
      }
      
      if (formatoData.tipo === 'especial' && formatoData.contenido) {
        nuevosCampos.contenidoEspecial = formatoData.contenido;
      }
      
      if (Object.keys(nuevosCampos).length > 0) {
        setFormData((prev: any) => ({ ...prev, ...nuevosCampos }));
      }
    }
  }, [formatoData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      let newData = { ...prev, [name]: value };
      
      if (contenidoEditable && contenidoTemplate && name !== 'contenidoEspecial') {
        const reemplazos: Record<string, string> = {};
        
        for (const [key, val] of Object.entries(newData)) {
          if (val) {
            reemplazos[key] = String(val);
          }
        }
        
        let contenidoGenerado = contenidoTemplate;
        for (const [key, val] of Object.entries(reemplazos)) {
          contenidoGenerado = contenidoGenerado.replace(new RegExp(`<${key}>`, 'gi'), val);
        }
        
        newData.contenidoEspecial = contenidoGenerado;
      }
      
      if (onFormChange) {
        onFormChange(newData);
      }
      return newData;
    });
    if (onChange) {
      onChange(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02 },
  };

  let lastSection = '';

  const sectionsWithFields: Record<string, typeof fields> = {};
  fields.forEach(field => {
    const section = field.section || 'OTROS';
    if (!sectionsWithFields[section]) {
      sectionsWithFields[section] = [];
    }
    sectionsWithFields[section].push(field);
  });

  const sectionOrder = ['REGISTRO', 'DIFUNTO', 'NOVIO', 'NOVIA', 'CONFIRMADO', 'BAUTIZADO', 'CATEQUIZANDO', 'SACRAMENTO', 'SACRAMENTOS', 'PADRES', 'ABUELOS', 'PADRINOS', 'BAUTISMO', 'TESTIGOS', 'CONYUGE', 'FAMILIA', 'ASIGNACION', 'ESPECIAL', 'NOTAS', 'OTROS'];

  if (simple) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="w-full"
          >
            <label className="mb-1 block text-sm font-medium text-slate-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'select' ? (
              <motion.select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                required={field.required}
              >
                <option value="">-</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </motion.select>
            ) : field.type === 'textarea' ? (
              <motion.textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                required={field.required}
              />
            ) : (
              <motion.input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                required={field.required}
              />
            )}
          </motion.div>
        ))}

        <motion.div 
          className="flex justify-end gap-3 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-100 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              submitLabel
            )}
          </motion.button>
        </motion.div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sectionOrder.map(sectionName => {
        const sectionFields = sectionsWithFields[sectionName];
        if (!sectionFields || sectionFields.length === 0) return null;
        
        if (sectionName === 'ESPECIAL') {
          const tipoFormato = formData?.tipoFormato;
          if (!tipoFormato || tipoFormato !== 'especial') return null;
        }
        
        if (sectionName === 'SACRAMENTOS') {
          return (
            <div key={sectionName} className="border border-indigo-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 pb-2 border-b border-indigo-100">
                {sectionName}
              </h4>
              <div className="space-y-4">
                {sectionFields.map((field, idx) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    {field.type === 'checkbox' ? (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={formData[field.name] || false}
                          onChange={(e) => {
                            setFormData((prev: any) => ({ ...prev, [field.name]: e.target.checked }));
                            if (onChange) onChange(field.name, e.target.checked);
                          }}
                          className="w-5 h-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-400"
                        />
                        <span className="text-sm font-medium text-slate-700">{field.label}</span>
                      </label>
                    ) : (
                      <>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'date' ? (
                          <input
                            type="date"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        ) : (
                          <input
                            type="text"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div key={sectionName} className="border border-indigo-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 pb-2 border-b border-indigo-100">
              {sectionName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sectionFields.map((field, idx) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={field.type === 'textarea' ? 'col-span-2 md:col-span-3 lg:col-span-4' : ''}
                >
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <motion.select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      required={field.required}
                    >
                      <option value="">-</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </motion.select>
                  ) : field.type === 'textarea' ? (
                    <motion.textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      readOnly={field.name === 'contenidoEspecial' && !contenidoEditable}
                      rows={field.name === 'contenidoEspecial' ? 12 : 2}
                      className={`w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${field.name === 'contenidoEspecial' && !contenidoEditable ? 'bg-gray-50 text-gray-600' : ''} ${field.name === 'contenidoEspecial' ? 'font-mono text-xs' : ''}`}
                      required={field.required}
                    />
                  ) : (
                    <motion.input
                      type={field.type || 'text'}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      required={field.required}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
      
      <motion.div 
        className="flex justify-end gap-3 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancelar
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            submitLabel
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}
