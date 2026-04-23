import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class DifuntosService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

  private assertAccesoParroquia(parroqId: number, usuario: any) {
    if (!this.isSuperAdmin(usuario) && usuario.parroqusiaId !== parroqId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }
  }

  async findAll(parroqusiaId: string, usuario: any) {
    const parroqId = Number(parroqusiaId);
    this.assertAccesoParroquia(parroqId, usuario);
    return this.prisma.difunto.findMany({ where: { parroqusiaId: parroqId }, orderBy: { fechaFallecimiento: 'desc' } });
  }

  async findOne(id: string, parroqusiaId: string, usuario: any) {
    const parroqId = Number(parroqusiaId);
    this.assertAccesoParroquia(parroqId, usuario);
    return this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: parroqId } });
  }

  async create(parroqusiaId: string, data: any, usuario: any) {
    const parroqId = Number(parroqusiaId);
    this.assertAccesoParroquia(parroqId, usuario);
    return this.prisma.difunto.create({ data: { ...data, parroqusiaId: parroqId } });
  }

  async update(id: string, parroqusiaId: string, data: any, usuario: any) {
    const parroqId = Number(parroqusiaId);
    this.assertAccesoParroquia(parroqId, usuario);
    const difunto = await this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: parroqId } });
    if (!difunto) throw new NotFoundException('Registro no encontrado');
    return this.prisma.difunto.update({ where: { id: Number(id) }, data });
  }

  async delete(id: string, parroqusiaId: string, usuario: any) {
    const parroqId = Number(parroqusiaId);
    this.assertAccesoParroquia(parroqId, usuario);
    const difunto = await this.prisma.difunto.findFirst({ where: { id: Number(id), parroqusiaId: parroqId } });
    if (!difunto) throw new NotFoundException('Registro no encontrado');
    return this.prisma.difunto.delete({ where: { id: Number(id) } });
  }
}
