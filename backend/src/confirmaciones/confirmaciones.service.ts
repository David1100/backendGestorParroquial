import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfirmacionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.confirmacion.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fechaSacramento: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.confirmacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.confirmacion.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const confirmacion = await this.prisma.confirmacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!confirmacion) throw new NotFoundException('Registro no encontrado');
    return this.prisma.confirmacion.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const confirmacion = await this.prisma.confirmacion.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!confirmacion) throw new NotFoundException('Registro no encontrado');
    return this.prisma.confirmacion.delete({ where: { id: Number(id) } });
  }
}
