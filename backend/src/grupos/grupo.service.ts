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
        catequizandos: { include: { catequesis: true } },
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
        catequizandos: { include: { catequesis: true } },
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

  async agregarCatequizandos(grupoId: string, catequesisIds: number[], parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    
    const catequizandos = catequesisIds.map((catequesisId) => ({
      grupoId: Number(grupoId),
      catequesisId,
    }));

    return this.prisma.catequizandoGrupo.createMany({
      data: catequizandos,
      skipDuplicates: true,
    });
  }

  async eliminarCatequizandos(grupoId: string, catequesisId: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequizandoGrupo.delete({
      where: {
        catequesisId_grupoId: {
          catequesisId: Number(catequesisId),
          grupoId: Number(grupoId),
        },
      },
    });
  }

  async asignarGrupos(catequesisId: string, gruposIds: number[], parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    
    await this.prisma.catequizandoGrupo.deleteMany({
      where: { catequesisId: Number(catequesisId) },
    });

    if (gruposIds.length > 0) {
      const catequizandos = gruposIds.map((grupoId) => ({
        catequesisId: Number(catequesisId),
        grupoId,
      }));

      return this.prisma.catequizandoGrupo.createMany({
        data: catequizandos,
        skipDuplicates: true,
      });
    }

    return { count: 0 };
  }

  async obtenerGruposDeCatequizando(catequesisId: string, parroqusiaId: string, usuario: any) {
    if (usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');
    return this.prisma.catequizandoGrupo.findMany({
      where: { catequesisId: Number(catequesisId) },
      include: { grupo: true },
    });
  }
}
