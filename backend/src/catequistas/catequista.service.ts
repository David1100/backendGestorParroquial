import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatequistaService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequista.findMany({
      where: { parroqusiaId: Number(parroqusiaId) },
      include: {
        grupos: { include: { grupo: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequista.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
      include: {
        grupos: { include: { grupo: true } },
      },
    });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequista.create({
      data: { ...data, parroqusiaId: Number(parroqusiaId) },
    });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const catequista = await this.prisma.catequista.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!catequista) throw new NotFoundException('Catequista no encontrado');
    return this.prisma.catequista.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if ( usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const catequista = await this.prisma.catequista.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!catequista) throw new NotFoundException('Catequista no encontrado');
    return this.prisma.catequista.delete({ where: { id: Number(id) } });
  }
}
