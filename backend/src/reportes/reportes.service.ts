import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async getReportes(parroqusiaId: string, usuario: any) {
    const isSuperAdmin = usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) throw new ForbiddenException('No access');

    const idNum = Number(parroqusiaId);
    const [bautizos, confirmaciones, matrimonios, difuntos, catequesis, donaciones] = await Promise.all([
      (this.prisma.bautizo as any).count({ where: { parroqusiaId: idNum } }),
      (this.prisma.confirmacion as any).count({ where: { parroqusiaId: idNum } }),
      (this.prisma.matrimonio as any).count({ where: { parroqusiaId: idNum } }),
      (this.prisma.difunto as any).count({ where: { parroqusiaId: idNum } }),
      (this.prisma.catequesis as any).count({ where: { parroqusiaId: idNum } }),
      (this.prisma.donacion as any).aggregate({
        where: { parroqusiaId: idNum },
        _sum: { monto: true },
      }),
    ]);

    return {
      bautizos,
      confirmaciones,
      matrimonios,
      difuntos,
      catequesis,
      totalDonaciones: Number(donaciones?._sum?.monto || 0),
    };
  }
}
