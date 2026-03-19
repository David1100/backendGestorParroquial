import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        perfil: {
          include: {
            permisos: true,
          },
        },
        parroqusia: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      parroqusiaId: usuario.parroqusiaId,
      perfilId: usuario.perfilId,
    };

    const permisos = usuario.perfil.permisos.map((p) => ({
      modulo: p.modulo,
      ver: p.ver,
      crear: p.crear,
      editar: p.editar,
      eliminar: p.eliminar,
    }));

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        parroqusia: usuario.parroqusia?.nombre,
        parroqusiaId: usuario.parroqusiaId,
      },
      perfil: {
        id: usuario.perfil.id,
        nombre: usuario.perfil.nombre,
      },
      permisos,
    };
  }

  async validateUser(payload: any) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
      include: {
        perfil: {
          include: {
            permisos: true,
          },
        },
        parroqusia: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    return usuario;
  }
}
