import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.evento.findMany({ where: { parroqusiaId: Number(parroqusiaId) }, orderBy: { fechaInicio: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.evento.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.evento.create({ data: { ...data, parroqusiaId: Number(parroqusiaId) } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const evento = await this.prisma.evento.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!evento) throw new NotFoundException('Registro no encontrado');
    return this.prisma.evento.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const evento = await this.prisma.evento.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!evento) throw new NotFoundException('Registro no encontrado');
    return this.prisma.evento.delete({ where: { id: Number(id) } });
  }
}
