import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const ADMIN_PARROQUIAL_PROFILE = 'Administrador Parroquial';
const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const SYSTEM_PARROQUIA_NAME = 'Parroquia Principal';

const ADMIN_PARROQUIAL_PERMISSIONS: Array<{ modulo: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }> = [
  { modulo: 'usuarios', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'perfiles', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'permisos', ver: true, crear: false, editar: true, eliminar: false },
  { modulo: 'bautizos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'confirmaciones', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'matrimonios', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'difuntos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'catequesis', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'reportes', ver: true, crear: false, editar: false, eliminar: false },
  { modulo: 'indices', ver: true, crear: false, editar: false, eliminar: false },
  { modulo: 'citas', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'grupos', ver: true, crear: true, editar: true, eliminar: true },
  { modulo: 'firmantes', ver: true, crear: true, editar: true, eliminar: true },
];

@Injectable()
export class ParroquiasService {
  constructor(private prisma: PrismaService) {}

  private assertSuperAdmin(usuario: any) {
    const isSuperAdmin = usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
    if (!isSuperAdmin) {
      throw new ForbiddenException('Solo el Super Admin puede gestionar parroquias');
    }
  }

  async findAll(usuario: any) {
    this.assertSuperAdmin(usuario);

    return this.prisma.parroquia.findMany({
      where: {
        nombre: { not: SYSTEM_PARROQUIA_NAME },
      },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
            perfil: {
              select: { nombre: true },
            },
          },
        },
        _count: {
          select: { usuarios: true, perfiles: true },
        },
      },
    });
  }

  async findOne(id: string, usuario: any) {
    this.assertSuperAdmin(usuario);

    const parroqusia = await this.prisma.parroquia.findFirst({
      where: { id: Number(id), nombre: { not: SYSTEM_PARROQUIA_NAME } },
      include: {
        usuarios: true,
        perfiles: true,
      },
    });

    if (!parroqusia) {
      return null;
    }

    return parroqusia;
  }

  async create(data: {
    nombre: string;
    direccion?: string;
    telefono?: string;
    ciudad: string;
    adminNombre: string;
    adminEmail: string;
    adminPassword: string;
  }, usuario: any) {
    this.assertSuperAdmin(usuario);

    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const parroquia = await tx.parroquia.create({
        data: {
          nombre: data.nombre,
          direccion: data.direccion,
          telefono: data.telefono,
          ciudad: data.ciudad,
        },
      });

      const perfilAdmin = await tx.perfil.create({
        data: {
          nombre: ADMIN_PARROQUIAL_PROFILE,
          descripcion: 'Administrador general de la parroquia',
          parroqusiaId: parroquia.id,
        },
      });

      await tx.permiso.createMany({
        data: ADMIN_PARROQUIAL_PERMISSIONS.map((permiso) => ({
          perfilId: perfilAdmin.id,
          modulo: permiso.modulo,
          ver: permiso.ver,
          crear: permiso.crear,
          editar: permiso.editar,
          eliminar: permiso.eliminar,
        })),
      });

      const admin = await tx.usuario.create({
        data: {
          nombre: data.adminNombre,
          email: data.adminEmail,
          password: hashedPassword,
          activo: true,
          parroqusiaId: parroquia.id,
          perfilId: perfilAdmin.id,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
        },
      });

      return {
        ...parroquia,
        admin,
      };
    });
  }

  async update(id: string, data: { nombre?: string; direccion?: string; telefono?: string; ciudad?: string }, usuario: any) {
    this.assertSuperAdmin(usuario);

    return this.prisma.parroquia.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, usuario: any) {
    this.assertSuperAdmin(usuario);

    return this.prisma.parroquia.delete({ where: { id: Number(id) } });
  }
}
