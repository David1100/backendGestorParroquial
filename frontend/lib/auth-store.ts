import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const SUPER_ADMIN_ALLOWED: Record<string, Set<'ver' | 'crear' | 'editar' | 'eliminar'>> = {
  usuarios: new Set<'ver' | 'crear' | 'editar' | 'eliminar'>(['ver', 'crear', 'editar', 'eliminar']),
  parroquias: new Set<'ver' | 'crear' | 'editar' | 'eliminar'>(['ver', 'crear', 'editar', 'eliminar']),
  perfiles: new Set<'ver' | 'crear' | 'editar' | 'eliminar'>(['ver']),
};

interface Permiso {
  modulo: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  parroqusia?: string;
  parroqusiaId?: number;
  parroqusiaDireccion?: string;
  parroqusiaTelefono?: string;
  parroqusiaCiudad?: string;
  // Alias
  [key: string]: any;
}

interface Perfil {
  id: string;
  nombre: string;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  perfil: Perfil | null;
  permisos: Permiso[];
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (data: { token?: string; access_token?: string; usuario: Usuario; perfil: Perfil; permisos: Permiso[] }) => void;
  logout: () => void;
  can: (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      perfil: null,
      permisos: [],
      isAuthenticated: false,
      hasHydrated: false,

      login: (data) => {
        const token = data.token ?? data.access_token ?? null;

        if (token) {
          localStorage.setItem('token', token);
        }

        set({
          token,
          usuario: data.usuario,
          perfil: data.perfil,
          permisos: data.permisos,
          isAuthenticated: Boolean(token),
          hasHydrated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          usuario: null,
          perfil: null,
          permisos: [],
          isAuthenticated: false,
          hasHydrated: true,
        });
      },

      can: (modulo, accion) => {
        const { permisos, usuario, perfil } = get();
        const email = usuario?.email?.trim().toLowerCase();
        const profileName = perfil?.nombre?.trim().toLowerCase();
        const isSuperAdmin =
          email === SUPER_ADMIN_EMAIL.toLowerCase() ||
          profileName === SUPER_ADMIN_PROFILE.toLowerCase();

        if (isSuperAdmin) {
          return Boolean(SUPER_ADMIN_ALLOWED[modulo]?.has(accion));
        }

        const permiso = permisos.find((p) => p.modulo === modulo);
        return permiso ? permiso[accion] : false;
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);
