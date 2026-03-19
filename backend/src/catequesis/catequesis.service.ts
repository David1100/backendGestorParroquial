import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatequesisService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequesis.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fechaInicio: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequesis.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequesis.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const catequesis = await this.prisma.catequesis.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!catequesis) throw new NotFoundException('Registro no encontrado');
    return this.prisma.catequesis.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const catequesis = await this.prisma.catequesis.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!catequesis) throw new NotFoundException('Registro no encontrado');
    return this.prisma.catequesis.delete({ where: { id: Number(id) } });
  }
}
