import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrupoService {
  constructor(private prisma: PrismaService) {}

  async findAll(parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.grupo.findMany({
      where: { parroqusiaId: Number(parroqusiaId) },
      include: {
        catequistas: { include: { catequista: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.grupo.findFirst({
      where: { id: Number(id), parroqusiaId: Number(parroqusiaId) },
      include: {
        catequistas: { include: { catequista: true } },
      },
    });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.grupo.create({
      data: { ...data, parroqusiaId: Number(parroqusiaId) },
    });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const grupo = await this.prisma.grupo.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    return this.prisma.grupo.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    const grupo = await this.prisma.grupo.findFirst({ where: { id: Number(id), parroqusiaId: Number(parroqusiaId) } });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    return this.prisma.grupo.delete({ where: { id: Number(id) } });
  }

  async agregarCatequista(grupoId: string, catequistaId: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequistaGrupo.create({
      data: {
        grupoId: Number(grupoId),
        catequistaId: Number(catequistaId),
      },
    });
  }

  async eliminarCatequista(grupoId: string, catequistaId: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequistaGrupo.delete({
      where: {
        catequistaId_grupoId: {
          catequistaId: Number(catequistaId),
          grupoId: Number(grupoId),
        },
      },
    });
  }
}
