import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const ADMIN_PARROQUIAL_PROFILE = 'Administrador Parroquial';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

  private async validarPerfilAsignable(perfilId: number, parroqusiaId: number, usuario: any) {
    const perfil = await this.prisma.perfil.findFirst({
      where: { id: perfilId, parroqusiaId },
    });

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado para esta parroquia');
    }

    if (this.isSuperAdmin(usuario) && perfil.nombre !== ADMIN_PARROQUIAL_PROFILE) {
      throw new ForbiddenException('El Super Admin solo puede asignar el perfil Administrador Parroquial');
    }

    if (perfil.nombre === SUPER_ADMIN_PROFILE && !this.isSuperAdmin(usuario)) {
      throw new ForbiddenException('Solo el Super Admin puede asignar el perfil Super Admin');
    }

    return perfil;
  }

  private assertSuperAdminCanManageUser(user: { perfil?: { nombre?: string } }, usuario: any) {
    if (!this.isSuperAdmin(usuario)) {
      return;
    }

    if (user?.perfil?.nombre !== ADMIN_PARROQUIAL_PROFILE) {
      throw new ForbiddenException('El Super Admin solo puede gestionar usuarios con perfil Administrador Parroquial');
    }
  }

  async findAll(parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const where = {
      parroqusiaId: Number(parroqusiaId),
      ...(isSuperAdmin
        ? {
            perfil: {
              nombre: ADMIN_PARROQUIAL_PROFILE,
            },
          }
        : {}),
    };

    return this.prisma.usuario.findMany({
      where,
      include: {
        perfil: true,
      },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const user = await this.prisma.usuario.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
      include: {
        perfil: true,
      },
    });

    if (!user) {
      return null;
    }

    this.assertSuperAdminCanManageUser(user, usuario);

    return user;
  }

  async create(parroqusiaId: string, data: { nombre: string; email: string; password: string; perfilId: string }, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    const parroqusiaIdNumber = Number(parroqusiaId);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    await this.validarPerfilAsignable(Number(data.perfilId), parroqusiaIdNumber, usuario);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hashedPassword,
        parroqusiaId: parroqusiaIdNumber,
        perfilId: Number(data.perfilId),
        activo: true,
      },
      include: {
        perfil: true,
      },
    });
  }

  async update(id: string, parroqusiaId: string, data: { nombre?: string; email?: string; password?: string; perfilId?: string; activo?: boolean }, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    const parroqusiaIdNumber = Number(parroqusiaId);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const existingUser = await this.prisma.usuario.findFirst({
      where: { id: Number(id), parroqusiaId: parroqusiaIdNumber },
      include: { perfil: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.assertSuperAdminCanManageUser(existingUser, usuario);

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.perfilId) {
      await this.validarPerfilAsignable(Number(data.perfilId), parroqusiaIdNumber, usuario);
      updateData.perfilId = Number(data.perfilId);
    }

    return this.prisma.usuario.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        perfil: true,
      },
    });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    const parroqusiaIdNumber = Number(parroqusiaId);
    
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const existingUser = await this.prisma.usuario.findFirst({
      where: { id: Number(id), parroqusiaId: parroqusiaIdNumber },
      include: { perfil: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.assertSuperAdminCanManageUser(existingUser, usuario);

    return this.prisma.usuario.delete({
      where: { id: Number(id) },
    });
  }
}
