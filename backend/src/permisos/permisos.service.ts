import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

  async findByPerfil(perfilId: string, parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const perfil = await this.prisma.perfil.findFirst({
      where: { id: Number(perfilId), parroqusiaId: Number(parroqusiaId) },
    });

    if (!perfil) {
      throw new ForbiddenException('Perfil no encontrado');
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede gestionar permisos del perfil Super Admin');
    }

    return this.prisma.permiso.findMany({
      where: { perfilId: Number(perfilId) },
    });
  }

  async update(perfilId: string, parroqusiaId: string, permisos: Array<{ modulo: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }>, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const perfil = await this.prisma.perfil.findFirst({
      where: { id: Number(perfilId), parroqusiaId: Number(parroqusiaId) },
    });

    if (!perfil) {
      throw new ForbiddenException('Perfil no encontrado');
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede gestionar permisos del perfil Super Admin');
    }

    await this.prisma.permiso.deleteMany({
      where: { perfilId: Number(perfilId) },
    });

    return this.prisma.permiso.createMany({
      data: permisos.map((p) => ({
        perfilId: Number(perfilId),
        modulo: p.modulo,
        ver: p.ver,
        crear: p.crear,
        editar: p.editar,
        eliminar: p.eliminar,
      })),
    });
  }
}
