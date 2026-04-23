import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class QuienfirmaService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

  async findAll(parroqusiaId: string, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    return this.prisma.quienFirma.findMany({
      where: { parroqusiaId: Number(parroqusiaId) },
      include: {
        firmantes: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    return this.prisma.quienFirma.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
      include: {
        firmantes: true,
      },
    });
  }

  async create(parroqusiaId: string, data: { nombre: string }, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    return this.prisma.quienFirma.create({
      data: {
        nombre: data.nombre,
        parroqusiaId: Number(parroqusiaId),
      },
    });
  }

  async update(id: string, parroqusiaId: string, data: { nombre?: string }, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const existing = await this.prisma.quienFirma.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
    });

    if (!existing) {
      throw new ForbiddenException('Registro no encontrado');
    }

    return this.prisma.quienFirma.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre ?? existing.nombre,
      },
    });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const existing = await this.prisma.quienFirma.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
    });

    if (!existing) {
      throw new ForbiddenException('Registro no encontrado');
    }

    await this.prisma.firmante.deleteMany({
      where: { quienFirmaId: Number(id) },
    });

    return this.prisma.quienFirma.delete({
      where: { id: Number(id) },
    });
  }

  async createFirmante(quienFirmaId: string, parroqusiaId: string, data: { nombre: string }, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const quienFirma = await this.prisma.quienFirma.findFirst({
      where: { id: Number(quienFirmaId), parroqusiaId: Number(parroqusiaId) },
    });

    if (!quienFirma) {
      throw new ForbiddenException('Rol no encontrado');
    }

    return this.prisma.firmante.create({
      data: {
        nombre: data.nombre,
        quienFirmaId: Number(quienFirmaId),
      },
    });
  }

  async updateFirmante(firmanteId: string, quienFirmaId: string, parroqusiaId: string, data: { nombre?: string }, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const firmante = await this.prisma.firmante.findFirst({
      where: {
        id: Number(firmanteId),
        quienFirma: {
          parroqusiaId: Number(parroqusiaId),
        },
      },
    });

    if (!firmante) {
      throw new ForbiddenException('Firmante no encontrado');
    }

    return this.prisma.firmante.update({
      where: { id: Number(firmanteId) },
      data: {
        nombre: data.nombre ?? firmante.nombre,
      },
    });
  }

  async deleteFirmante(firmanteId: string, quienFirmaId: string, parroqusiaId: string, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const firmante = await this.prisma.firmante.findFirst({
      where: {
        id: Number(firmanteId),
        quienFirma: {
          parroqusiaId: Number(parroqusiaId),
        },
      },
    });

    if (!firmante) {
      throw new ForbiddenException('Firmante no encontrado');
    }

    return this.prisma.firmante.delete({
      where: { id: Number(firmanteId) },
    });
  }
}
