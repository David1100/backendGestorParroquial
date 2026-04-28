'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth-store';
import { fetchAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { alertCitasProximas } from '@/lib/alerts';

const modulos = [
  { 
    nombre: 'Dashboard', 
    path: '/dashboard', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  { 
    nombre: 'Usuarios', 
    path: '/dashboard/usuarios', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    permiso: 'usuarios' 
  },
  { 
    nombre: 'Perfiles', 
    path: '/dashboard/perfiles', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    permiso: 'perfiles' 
  },
  { 
    nombre: 'Parroquias', 
    path: '/dashboard/parroquias', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    permiso: 'parroquias' 
  },
  { 
    nombre: 'Bautizos', 
    path: '/dashboard/bautizos', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    permiso: 'bautizos' 
  },
  { 
    nombre: 'Comuniones', 
    path: '/dashboard/comuniones', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    permiso: 'comuniones' 
  },
  { 
    nombre: 'Confirmaciones', 
    path: '/dashboard/confirmaciones', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    permiso: 'confirmaciones' 
  },
  { 
    nombre: 'Matrimonios', 
    path: '/dashboard/matrimonios', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    permiso: 'matrimonios' 
  },
  { 
    nombre: 'Defunciones', 
    path: '/dashboard/difuntos', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    permiso: 'difuntos' 
  },
  {
    nombre: 'Indices',
    path: '/dashboard/indices',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    permiso: 'indices'
  },
  { 
    nombre: 'Catequesis', 
    path: '/dashboard/catequesis', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    permiso: 'catequesis' 
  },
  {
    nombre: 'Citas',
    path: '/dashboard/citas',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm4-5h6" />
      </svg>
    ),
    permiso: 'citas'
  },
  { 
    nombre: 'Firmantes', 
    path: '/dashboard/quienfirma', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    permiso: 'firmantes' 
  },
  { 
    nombre: 'Grupos', 
    path: '/dashboard/grupos', 
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    permiso: 'grupos' 
  },
];

const menuSections = [
  {
    id: 'general',
    label: 'General',
    paths: ['/dashboard'],
  },
  {
    id: 'admin',
    label: 'Administracion',
    paths: ['/dashboard/parroquias', '/dashboard/usuarios', '/dashboard/perfiles', '/dashboard/quienfirma', '/dashboard/grupos'],
  },
  {
    id: 'registros',
    label: 'Registros Sacramentales',
    paths: ['/dashboard/bautizos', '/dashboard/confirmaciones', '/dashboard/matrimonios', '/dashboard/difuntos', '/dashboard/indices'],
  },
  {
    id: 'pastoral',
    label: 'Pastoral y Gestion',
    paths: ['/dashboard/catequesis', '/dashboard/donaciones', '/dashboard/inventario', '/dashboard/eventos', '/dashboard/citas'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated, logout, usuario, perfil, can, token } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string>('general');
const [todayCitasCount, setTodayCitasCount] = useState(0);
  const [proximasCitas, setProximasCitas] = useState<any[]>([]);
  const isSuperAdmin = perfil?.nombre === 'Super Admin' || usuario?.email === 'admin@parroquia.com';
  const parroquiaId = usuario?.parroquiaId ?? usuario?.parroqusiaId;
  const canViewCitas = can('citas', 'ver');

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const activeSection = menuSections
      .map((section) => {
        const bestMatchLength = section.paths.reduce((best, path) => {
          const matches = pathname === path || pathname.startsWith(`${path}/`);
          if (!matches) {
            return best;
          }
          return Math.max(best, path.length);
        }, -1);

        return { section, bestMatchLength };
      })
      .filter((item) => item.bestMatchLength >= 0)
      .sort((a, b) => b.bestMatchLength - a.bestMatchLength)[0]?.section;

    if (activeSection) {
      setOpenSectionId(activeSection.id);
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadTodayCitas = async () => {
      if (!hasHydrated || !isAuthenticated || !parroquiaId || !canViewCitas) {
        setTodayCitasCount(0);
        return;
      }

      try {
        const citas = await fetchAPI(`/parroquias/${parroquiaId}/citas`);
        const today = new Date();

        const count = Array.isArray(citas)
          ? citas.filter((cita: any) => {
              if (!cita?.fechaHora) return false;
              const fecha = new Date(cita.fechaHora);
              return (
                fecha.getFullYear() === today.getFullYear() &&
                fecha.getMonth() === today.getMonth() &&
                fecha.getDate() === today.getDate()
              );
            }).length
          : 0;

        if (!cancelled) {
          setTodayCitasCount(count);
        }
      } catch {
        if (!cancelled) {
          setTodayCitasCount(0);
        }
      }
    };

loadTodayCitas();

    const fetchProximas = async () => {
      if (!hasHydrated || !isAuthenticated || !parroquiaId || !canViewCitas) {
        setProximasCitas([]);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/parroquias/${parroquiaId}/citas/proximas`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const citasProximas = await res.json();
        console.log('Citas proximas:', citasProximas);
        if (!cancelled) {
          setProximasCitas(citasProximas || []);
          if (citasProximas && Array.isArray(citasProximas) && citasProximas.length > 0) {
            alertCitasProximas(citasProximas);
          }
        }
      } catch (err) {
        console.error('Error fetching citas proximas:', err);
        if (!cancelled) {
          setProximasCitas([]);
        }
      }
    };

    fetchProximas();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, parroquiaId, canViewCitas, pathname]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Cargando sesion...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Redirigiendo al inicio de sesion...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const moduloActual = [...modulos]
    .sort((a, b) => b.path.length - a.path.length)
    .find((m) => pathname.startsWith(m.path));
  const visibleModules = modulos.filter((m) => {
    return !m.permiso || can(m.permiso, 'ver');
  });
  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: visibleModules.filter((item) => section.paths.includes(item.path)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen flex bg-transparent">
      <motion.aside 
        className={`relative z-20 flex flex-col border-r border-indigo-100/70 bg-white/90 shadow-xl backdrop-blur ${isSidebarOpen ? 'w-72' : 'w-20'}`}
        animate={{ width: isSidebarOpen ? 288 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="p-6 border-b border-gray-100"
          animate={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src="/logotipo.webp" 
                alt="LumenCloud" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </motion.div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                    LumenCloud
                  </h1>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{usuario?.parroquia}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors z-30"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 text-gray-500 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <nav className="flex-1 overflow-y-auto p-3">
          {!isSidebarOpen ? (
            <ul className="space-y-1">
              {visibleModules.map((modulo, index) => {
                const isActive = pathname === modulo.path || (modulo.path !== '/dashboard' && pathname.startsWith(modulo.path));

                return (
                  <motion.li
                    key={modulo.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={modulo.path}
                      className={`flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={modulo.nombre}
                    >
                      <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} transition-colors`}>
                        {modulo.icono}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-4">
              {visibleSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSectionId((prev) => (prev === section.id ? '' : section.id))
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50"
                  >
                    <span>{section.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${openSectionId === section.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSectionId === section.id && (
                      <motion.ul
                        key={`${section.id}-items`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="space-y-1 overflow-hidden"
                      >
                        {section.items.map((modulo) => {
                          const isActive = pathname === modulo.path || (modulo.path !== '/dashboard' && pathname.startsWith(modulo.path));

                          return (
                            <li key={modulo.path}>
                              <Link
                                href={modulo.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                  isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} transition-colors`}>
                                  {modulo.icono}
                                </span>
                                <span className="font-medium whitespace-nowrap">{modulo.nombre}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={handleLogout}
              className={`p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${isSidebarOpen ? '' : 'ml-0'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-indigo-100/80 bg-white/80 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <motion.h2
              className="text-2xl font-bold text-slate-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {moduloActual?.nombre || 'Dashboard'}
            </motion.h2>

{canViewCitas && (
              <div className="relative group">
                <Link
                  href="/dashboard/citas"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-white text-slate-600 shadow-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  title="Citas de hoy"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {todayCitasCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                      {todayCitasCount}
                    </span>
                  )}
                </Link>
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg bg-white p-3 shadow-xl ring-1 ring-slate-200 hidden group-hover:block">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Proximas citas</p>
                  {!Array.isArray(proximasCitas) || proximasCitas.length === 0 ? (
                    <p className="text-xs text-slate-400">No hay citas proximas</p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {proximasCitas.map((cita: any) => {
                        const fecha = new Date(cita.fechaHora);
                        const now = new Date();
                        const diffMins = Math.round((fecha.getTime() - now.getTime()) / 60000);
                        const timeLabel = diffMins <= 60 ? `${diffMins} min` : `${Math.round(diffMins / 60)} hrs`;
                        return (
                          <div key={cita.id} className="rounded bg-slate-50 p-2 text-xs">
                            <p className="font-medium text-slate-700">{cita.feligres}</p>
                            <p className="text-slate-500">{cita.sacerdote}</p>
                            <p className="text-indigo-600">{timeLabel} - {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
