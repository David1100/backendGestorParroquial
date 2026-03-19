import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatrimoniosService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.matrimonio.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fecha: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.matrimonio.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.matrimonio.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const matrimonio = await this.prisma.matrimonio.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!matrimonio) throw new NotFoundException('Registro no encontrado');
    return this.prisma.matrimonio.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const matrimonio = await this.prisma.matrimonio.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!matrimonio) throw new NotFoundException('Registro no encontrado');
    return this.prisma.matrimonio.delete({ where: { id: Number(id) } });
  }
}
