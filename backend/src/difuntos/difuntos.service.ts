import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DifuntosService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.difunto.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fechaFallecimiento: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.difunto.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const difunto = await this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!difunto) throw new NotFoundException('Registro no encontrado');
    return this.prisma.difunto.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const difunto = await this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!difunto) throw new NotFoundException('Registro no encontrado');
    return this.prisma.difunto.delete({ where: { id: Number(id) } });
  }
}
