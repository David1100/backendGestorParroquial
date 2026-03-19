import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.inventarioItem.findMany({ where: { parroqusiaId: Number(parroqusiaId) } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.inventarioItem.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.inventarioItem.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const item = await this.prisma.inventarioItem.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    return this.prisma.inventarioItem.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const item = await this.prisma.inventarioItem.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    return this.prisma.inventarioItem.delete({ where: { id: Number(id) } });
  }
}
