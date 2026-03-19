import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonacionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.donacion.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fecha: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.donacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.donacion.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const donacion = await this.prisma.donacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!donacion) throw new NotFoundException('Registro no encontrado');
    return this.prisma.donacion.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const donacion = await this.prisma.donacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!donacion) throw new NotFoundException('Registro no encontrado');
    return this.prisma.donacion.delete({ where: { id: Number(id) } });
  }
}
