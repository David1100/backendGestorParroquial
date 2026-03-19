import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const SUPER_ADMIN_ALLOWED_PERMISSIONS: Record<string, Set<string>> = {
  usuarios: new Set(['ver', 'crear', 'editar', 'eliminar']),
  parroquias: new Set(['ver', 'crear', 'editar', 'eliminar']),
  perfiles: new Set(['ver']),
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<{ modulo: string; accion: string }>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const { modulo, accion } = requiredPermission;
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;
    const isSuperAdmin = usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;

    if (isSuperAdmin) {
      const allowedActions = SUPER_ADMIN_ALLOWED_PERMISSIONS[modulo];
      return Boolean(allowedActions?.has(accion));
    }

    if (modulo === 'parroquias') {
      return false;
    }

    if (!usuario || !usuario.perfil || !usuario.perfil.permisos) {
      return false;
    }

    const permiso = usuario.perfil.permisos.find((p: any) => p.modulo === modulo);

    if (!permiso) {
      return false;
    }

    return permiso[accion] === true;
  }
}
