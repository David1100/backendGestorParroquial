import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export const Permission = (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar') =>
  SetMetadata(PERMISSION_KEY, { modulo, accion });
