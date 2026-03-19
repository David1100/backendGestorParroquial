import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComunionesService {
  constructor(private prisma: PrismaService) {}

  private async validarLibroFolioNumero(parroqusiaId: number, libro?: string, folio?: string, numero?: string, excludeId?: number) {
    if (!libro && !folio && !numero) {
      return;
    }

    const whereClause: any = {
      parroqusiaId,
    };

    if (libro) whereClause.libro = libro;
    if (folio) whereClause.folio = folio;
    if (numero) whereClause.numero = numero;

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existing = await this.prisma.comunion.findFirst({
      where: whereClause,
    });

    if (existing) {
      throw new ConflictException('Ya existe un registro con ese libro, folio y número');
    }
  }

  async findAll(parroqusiaId: string, usuario: any) {
    const parroqId = Number(parroqusiaId);
    if (usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    return this.prisma.comunion.findMany({
      where: { parroqusiaId: parroqId },
      orderBy: { fechaSacramento: 'desc' },
    });
  }

  async findOne(id: string, parroquianiaId: string, usuario: any) {
    const parroqId = Number(parroquianiaId);
    if (usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    return this.prisma.comunion.findFirst({
      where: { id: Number(id), parroqusiaId: parroqId },
    });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    const parroqId = Number(parroqusiaId);
    if (usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    if (data.libro || data.folio || data.numero) {
      await this.validarLibroFolioNumero(parroqId, data.libro, data.folio, data.numero);
    }

    return this.prisma.comunion.create({
      data: {
        ...data,
        parroqusiaId: parroqId,
      },
    });
  }

  async update(id: string, parroquianiaId: string, data: any, usuario: any) {
    const parroqId = Number(parroquianiaId);
    if (usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const comunion = await this.prisma.comunion.findFirst({
      where: { id: Number(id), parroqusiaId: parroqId },
    });

    if (!comunion) {
      throw new NotFoundException('Registro no encontrado');
    }

    if (data.libro || data.folio || data.numero) {
      await this.validarLibroFolioNumero(parroqId, data.libro, data.folio, data.numero, Number(id));
    }

    return this.prisma.comunion.update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id: string, parroquianiaId: string, usuario: any) {
    const parroqId = Number(parroquianiaId);
    if (usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }

    const comunion = await this.prisma.comunion.findFirst({
      where: { id: Number(id), parroqusiaId: parroqId },
    });

    if (!comunion) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.prisma.comunion.delete({
      where: { id: Number(id) },
    });
  }
}
