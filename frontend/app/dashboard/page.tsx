'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import SkeletonCard from '@/components/SkeletonCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { usuario, can } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;

  useEffect(() => {
    if (can('reportes', 'ver') && parroquiaId) {
      setLoadingStats(true);
      fetchAPI(`/parroquias/${parroquiaId}/reportes`)
        .then((data: any) => {
          setStats(data);
          setLoadingStats(false);
        })
        .catch(() => setLoadingStats(false));
    } else {
      setLoadingStats(false);
    }
  }, [parroquiaId]);

  const modulos = [
    { 
      nombre: 'Bautizos', 
      path: '/dashboard/bautizos', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      permiso: 'bautizos', 
      count: stats?.bautizos,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    { 
      nombre: 'Comuniones', 
      path: '/dashboard/comuniones', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      permiso: 'comuniones', 
      count: stats?.comuniones,
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    { 
      nombre: 'Confirmaciones', 
      path: '/dashboard/confirmaciones', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      permiso: 'confirmaciones', 
      count: stats?.confirmaciones,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    { 
      nombre: 'Matrimonios', 
      path: '/dashboard/matrimonios', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      permiso: 'matrimonios', 
      count: stats?.matrimonios,
      color: 'from-rose-400 to-red-500',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    { 
      nombre: 'Difuntos', 
      path: '/dashboard/difuntos', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      permiso: 'difuntos', 
      count: stats?.difuntos,
      color: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
    },
    { 
      nombre: 'Catequesis', 
      path: '/dashboard/catequesis', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      permiso: 'catequesis', 
      count: stats?.catequesis,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    { 
      nombre: 'Donaciones', 
      path: '/dashboard/donaciones', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      permiso: 'donaciones', 
      count: stats?.totalDonaciones,
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    { 
      nombre: 'Inventario', 
      path: '/dashboard/inventario', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      permiso: 'inventario', 
      count: null,
      color: 'from-indigo-400 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    { 
      nombre: 'Eventos', 
      path: '/dashboard/eventos', 
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      permiso: 'eventos', 
      count: null,
      color: 'from-violet-400 to-purple-500',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      nombre: 'Citas',
      path: '/dashboard/citas',
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm4-5h6" />
        </svg>
      ),
      permiso: 'citas',
      count: null,
      color: 'from-teal-400 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ];

  const visibleModules = modulos.filter(m => can(m.permiso, 'ver'));

  return (
    <div className="space-y-8">
      <motion.div 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <motion.h3 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Bienvenido, {usuario?.nombre}
          </motion.h3>
          <motion.p 
            className="text-white/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Parroquia: {usuario?.parroquia}
          </motion.p>
        </div>
      </motion.div>

      {loadingStats ? (
        <SkeletonCard count={visibleModules.length} />
      ) : (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleModules.map((modulo, index) => (
          <motion.a
            key={modulo.path}
            href={modulo.path}
            variants={itemVariants}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${modulo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${modulo.bgColor} ${modulo.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {modulo.icono}
                </div>
                {modulo.count !== null && (
                  <motion.span 
                    className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    {modulo.count}
                  </motion.span>
                )}
              </div>
              
              <motion.h4 
                className="mt-4 text-lg font-semibold text-gray-800 group-hover:text-gray-900"
              >
                {modulo.nombre}
              </motion.h4>
              
              <div className="mt-2 flex items-center text-sm text-gray-500 group-hover:text-gray-600">
                <span>Ver más</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>
      )}
    </div>
  );
}
