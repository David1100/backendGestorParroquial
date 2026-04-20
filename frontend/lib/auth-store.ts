import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  parroquia?: string;
  parroquiaId?: number;
  parroqusia?: string;
  parroqusiaId?: number;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
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
        const usuario = {
          ...data.usuario,
          parroquia: data.usuario.parroquia ?? data.usuario.parroqusia,
          parroquiaId: data.usuario.parroquiaId ?? data.usuario.parroqusiaId,
          parroqusia: data.usuario.parroqusia ?? data.usuario.parroquia,
          parroqusiaId: data.usuario.parroqusiaId ?? data.usuario.parroquiaId,
          parroquiaDireccion: data.usuario.direccion,
          parroquiaTelefono: data.usuario.telefono,
          parroquiaCiudad: data.usuario.ciudad,
        };

        if (token) {
          localStorage.setItem('token', token);
        }

        set({
          token,
          usuario,
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
        const { permisos } = get();
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
