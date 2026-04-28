import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  private validarAcceso(parroqusiaId: number, usuario: any) {
    const isSuperAdmin = usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
    if (!isSuperAdmin && usuario?.parroqusiaId !== parroqusiaId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }
  }

  async findAll(parroqusiaId: string, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    return this.prisma.cita.findMany({
      where: { parroqusiaId: idParroquia },
      orderBy: { fechaHora: 'asc' },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const cita = await this.prisma.cita.findFirst({
      where: { id: Number(id), parroqusiaId: idParroquia },
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    return cita;
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const fechaHora = new Date(data.fechaHora);
    const conflicto = await this.prisma.cita.findFirst({
      where: {
        parroqusiaId: idParroquia,
        sacerdote: data.sacerdote,
        fechaHora,
        estado: { not: 'cancelada' },
      },
    });

    if (conflicto) {
      throw new BadRequestException('Ya existe una cita para ese sacerdote en ese horario');
    }

    return this.prisma.cita.create({
      data: {
        ...data,
        fechaHora,
        parroqusiaId: idParroquia,
      },
    });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const cita = await this.prisma.cita.findFirst({
      where: { id: Number(id), parroqusiaId: idParroquia },
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    const fechaHora = data.fechaHora ? new Date(data.fechaHora) : cita.fechaHora;
    const sacerdote = data.sacerdote ?? cita.sacerdote;

    const conflicto = await this.prisma.cita.findFirst({
      where: {
        id: { not: Number(id) },
        parroqusiaId: idParroquia,
        sacerdote,
        fechaHora,
        estado: { not: 'cancelada' },
      },
    });

    if (conflicto) {
      throw new BadRequestException('Ya existe una cita para ese sacerdote en ese horario');
    }

    return this.prisma.cita.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(data.fechaHora ? { fechaHora } : {}),
      },
    });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const cita = await this.prisma.cita.findFirst({
      where: { id: Number(id), parroqusiaId: idParroquia },
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    return this.prisma.cita.delete({
      where: { id: Number(id) },
    });
  }

  async findProximas(parroqusiaId: string, minutos: number = 120, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const ahora = new Date();
    const limite = new Date(ahora.getTime() + minutos * 60 * 1000);

    return this.prisma.cita.findMany({
      where: {
        parroqusiaId: idParroquia,
        fechaHora: {
          gte: ahora,
          lte: limite,
        },
        estado: { in: ['pendiente', 'confirmada'] },
      },
      orderBy: { fechaHora: 'asc' },
    });
  }
}
