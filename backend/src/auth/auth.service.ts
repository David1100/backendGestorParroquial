import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';
const SUPER_ADMIN_ALLOWED_PERMISSIONS: Record<string, Set<'ver' | 'crear' | 'editar' | 'eliminar'>> = {
  usuarios: new Set(['ver', 'crear', 'editar', 'eliminar']),
  parroquias: new Set(['ver', 'crear', 'editar', 'eliminar']),
  perfiles: new Set(['ver']),
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private isSuperAdmin(usuario: { email?: string; perfil?: { nombre?: string } }) {
    return usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
  }

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

    const isSuperAdmin = this.isSuperAdmin(usuario);

    const permisos = usuario.perfil.permisos.map((p) => {
      if (!isSuperAdmin) {
        return {
          modulo: p.modulo,
          ver: p.ver,
          crear: p.crear,
          editar: p.editar,
          eliminar: p.eliminar,
        };
      }

      const allowedActions = SUPER_ADMIN_ALLOWED_PERMISSIONS[p.modulo];

      return {
        modulo: p.modulo,
        ver: Boolean(allowedActions?.has('ver')),
        crear: Boolean(allowedActions?.has('crear')),
        editar: Boolean(allowedActions?.has('editar')),
        eliminar: Boolean(allowedActions?.has('eliminar')),
      };
    });

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        parroqusia: usuario.parroqusia?.nombre,
        parroqusiaId: usuario.parroqusiaId,
        parroquiaDireccion: usuario.parroqusia?.direccion,
        parroquiaTelefono: usuario.parroqusia?.telefono,
        parroquiaCiudad: usuario.parroqusia?.ciudad,
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
