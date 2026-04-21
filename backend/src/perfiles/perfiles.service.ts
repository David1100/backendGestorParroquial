import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const ADMIN_PARROQUIAL_PROFILE = 'Administrador Parroquial';
const MODULOS = [
  'usuarios', 'perfiles', 'parroquias', 'bautizos', 'confirmaciones',
  'matrimonios', 'difuntos', 'catequesis', 'donaciones', 'inventario', 'permisos',
  'eventos', 'reportes', 'citas', 'grupos', 'firmantes',
];
const SUPER_ADMIN_ALLOWED_MODULES = new Set(['usuarios', 'parroquias']);
const ADMIN_PARROQUIAL_PERMISSIONS: Array<{ modulo: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }> = [
  { modulo: 'usuarios', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'perfiles', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'permisos', ver: true, crear: false, editar: true, eliminar: false },
  { modulo: 'bautizos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'confirmaciones', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'matrimonios', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'difuntos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'catequesis', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'donaciones', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'inventario', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'eventos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'reportes', ver: true, crear: false, editar: false, eliminar: false },
  { modulo: 'citas', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'grupos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'firmantes', ver: true, crear: true, editar: true, eliminar: true },
];

function superAdminPermission(modulo: string) {
  const allowed = SUPER_ADMIN_ALLOWED_MODULES.has(modulo);
  return {
    modulo,
    ver: allowed,
    crear: allowed,
    editar: allowed,
    eliminar: allowed,
  };
}

@Injectable()
export class PerfilesService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

  private async ensureSuperAdminProfile(parroqusiaId: number) {
    const existing = await this.prisma.perfil.findFirst({
      where: {
        parroqusiaId,
        nombre: SUPER_ADMIN_PROFILE,
      },
    });

    if (existing) {
      const existingPerms = await this.prisma.permiso.findMany({
        where: { perfilId: existing.id },
        select: { id: true, modulo: true },
      });
      const modulesSet = new Set(existingPerms.map((p) => p.modulo));
      const missing = MODULOS.filter((modulo) => !modulesSet.has(modulo));

      await Promise.all(
        existingPerms.map((permiso) =>
          this.prisma.permiso.update({
            where: { id: permiso.id },
            data: superAdminPermission(permiso.modulo),
          }),
        ),
      );

      if (missing.length > 0) {
        await this.prisma.permiso.createMany({
          data: missing.map((modulo) => ({
            perfilId: existing.id,
            ...superAdminPermission(modulo),
          })),
        });
      }

      return existing;
    }

    const perfil = await this.prisma.perfil.create({
      data: {
        nombre: SUPER_ADMIN_PROFILE,
        descripcion: 'Perfil con acceso total al sistema',
        parroqusiaId,
      },
    });

    await this.prisma.permiso.createMany({
      data: MODULOS.map((modulo) => ({
        perfilId: perfil.id,
        ...superAdminPermission(modulo),
      })),
    });

    return perfil;
  }

  private async ensureAdminParroquialProfile(parroqusiaId: number) {
    const existing = await this.prisma.perfil.findFirst({
      where: {
        parroqusiaId,
        nombre: ADMIN_PARROQUIAL_PROFILE,
      },
    });

    if (existing) {
      return existing;
    }

    const perfil = await this.prisma.perfil.create({
      data: {
        nombre: ADMIN_PARROQUIAL_PROFILE,
        descripcion: 'Administrador general de la parroquia',
        parroqusiaId,
      },
    });

    await this.prisma.permiso.createMany({
      data: ADMIN_PARROQUIAL_PERMISSIONS.map((permiso) => ({
        perfilId: perfil.id,
        modulo: permiso.modulo,
        ver: permiso.ver,
        crear: permiso.crear,
        editar: permiso.editar,
        eliminar: permiso.eliminar,
      })),
    });

    return perfil;
  }

  async findAll(parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    const parroqusiaIdNumber = Number(parroqusiaId);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    if (isSuperAdmin) {
      await this.ensureSuperAdminProfile(parroqusiaIdNumber);
      await this.ensureAdminParroquialProfile(parroqusiaIdNumber);
    }

    return this.prisma.perfil.findMany({
      where: {
        parroqusiaId: parroqusiaIdNumber,
        ...(isSuperAdmin
          ? { nombre: ADMIN_PARROQUIAL_PROFILE }
          : { nombre: { not: SUPER_ADMIN_PROFILE } }),
      },
      include: {
        permisos: true,
        _count: {
          select: { usuarios: true },
        },
      },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const perfil = await this.prisma.perfil.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
      include: {
        permisos: true,
      },
    });

    if (!perfil) {
      return null;
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !isSuperAdmin) {
      throw new ForbiddenException('No tienes acceso a este perfil');
    }

    return perfil;
  }

  async create(parroqusiaId: string, data: { nombre: string; descripcion?: string }, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    if (data.nombre?.trim().toLowerCase() === SUPER_ADMIN_PROFILE.toLowerCase() && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede crear el perfil Super Admin');
    }

    return this.prisma.perfil.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        parroqusiaId: Number(parroqusiaId),
      },
    });
  }

  async update(id: string, parroqusiaId: string, data: { nombre?: string; descripcion?: string }, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const perfil = await this.prisma.perfil.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
    });

    if (!perfil) {
      throw new ForbiddenException('Perfil no encontrado');
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede modificar este perfil');
    }

    if (data.nombre?.trim().toLowerCase() === SUPER_ADMIN_PROFILE.toLowerCase() && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede nombrar un perfil como Super Admin');
    }

    const updateData: { nombre?: string; descripcion?: string } = {};

    if (typeof data.nombre === 'string') {
      updateData.nombre = data.nombre;
    }

    if (typeof data.descripcion === 'string') {
      updateData.descripcion = data.descripcion;
    }

    return this.prisma.perfil.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const perfil = await this.prisma.perfil.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
    });

    if (!perfil) {
      throw new ForbiddenException('Perfil no encontrado');
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede eliminar este perfil');
    }

    return this.prisma.perfil.delete({
      where: { id: Number(id) },
    });
  }
}
