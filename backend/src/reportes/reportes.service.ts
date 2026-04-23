import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  private isSuperAdmin(usuario: any) {
    const email = usuario?.email?.trim().toLowerCase();
    const profileName = usuario?.perfil?.nombre?.trim().toLowerCase();
    return email === SUPER_ADMIN_EMAIL.toLowerCase() || profileName === SUPER_ADMIN_PROFILE.toLowerCase();
  }

  private assertParroquiaAccess(parroqusiaId: string, usuario: any) {
    const isSuperAdmin = this.isSuperAdmin(usuario);
    if (!isSuperAdmin && usuario.parroqusiaId !== Number(parroqusiaId)) {
      throw new ForbiddenException('No access');
    }
  }

  private toLibroNumber(value: unknown) {
    if (value === null || value === undefined) return null;
    const parsed = Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getSacramentoConfig(sacramento: string) {
    const normalized = sacramento.trim().toLowerCase();

    if (normalized === 'bautismo') {
      return {
        label: 'Bautismo',
        fetch: async (idNum: number) =>
          (this.prisma.bautizo as any).findMany({
            where: { parroqusiaId: idNum },
            select: {
              id: true,
              libro: true,
              folio: true,
              numero: true,
              nombres: true,
              apellidos: true,
              fechaSacramento: true,
            },
            orderBy: [{ createdAt: 'desc' }],
          }),
        map: (item: any) => ({
          id: item.id,
          libro: item.libro,
          folio: item.folio,
          numero: item.numero,
          nombre: [item.nombres, item.apellidos].filter(Boolean).join(' ').trim() || '-',
          fecha: item.fechaSacramento,
        }),
      };
    }

    if (normalized === 'confirmacion') {
      return {
        label: 'Confirmacion',
        fetch: async (idNum: number) =>
          (this.prisma.confirmacion as any).findMany({
            where: { parroqusiaId: idNum },
            select: {
              id: true,
              libro: true,
              folio: true,
              numero: true,
              nombres: true,
              apellidos: true,
              fechaSacramento: true,
            },
            orderBy: [{ createdAt: 'desc' }],
          }),
        map: (item: any) => ({
          id: item.id,
          libro: item.libro,
          folio: item.folio,
          numero: item.numero,
          nombre: [item.nombres, item.apellidos].filter(Boolean).join(' ').trim() || '-',
          fecha: item.fechaSacramento,
        }),
      };
    }

    if (normalized === 'matrimonio') {
      return {
        label: 'Matrimonio',
        fetch: async (idNum: number) =>
          (this.prisma.matrimonio as any).findMany({
            where: { parroqusiaId: idNum },
            select: {
              id: true,
              libro: true,
              folio: true,
              numero: true,
              nombreNovio: true,
              apellidoNovio: true,
              nombreNovia: true,
              apellidoNovia: true,
              fecha: true,
            },
            orderBy: [{ createdAt: 'desc' }],
          }),
        map: (item: any) => ({
          id: item.id,
          libro: item.libro,
          folio: item.folio,
          numero: item.numero,
          nombre: [
            [item.nombreNovio, item.apellidoNovio].filter(Boolean).join(' ').trim(),
            [item.nombreNovia, item.apellidoNovia].filter(Boolean).join(' ').trim(),
          ]
            .filter(Boolean)
            .join(' & ') || '-',
          fecha: item.fecha,
        }),
      };
    }

    if (normalized === 'defuncion') {
      return {
        label: 'Defuncion',
        fetch: async (idNum: number) =>
          (this.prisma.difunto as any).findMany({
            where: { parroqusiaId: idNum },
            select: {
              id: true,
              libro: true,
              folio: true,
              numero: true,
              nombre: true,
              apellidos: true,
              fechaFallecimiento: true,
            },
            orderBy: [{ createdAt: 'desc' }],
          }),
        map: (item: any) => ({
          id: item.id,
          libro: item.libro,
          folio: item.folio,
          numero: item.numero,
          nombre: [item.nombre, item.apellidos].filter(Boolean).join(' ').trim() || '-',
          fecha: item.fechaFallecimiento,
        }),
      };
    }

    throw new BadRequestException('Sacramento no valido');
  }

  async getReportes(parroqusiaId: string, usuario: any) {
    this.assertParroquiaAccess(parroqusiaId, usuario);

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

  async getIndices(
    parroqusiaId: string,
    sacramento: string,
    delLibroRaw: string,
    alLibroRaw: string,
    usuario: any,
  ) {
    this.assertParroquiaAccess(parroqusiaId, usuario);

    const delLibro = Number(delLibroRaw);
    const alLibro = Number(alLibroRaw);

    if (!Number.isInteger(delLibro) || !Number.isInteger(alLibro)) {
      throw new BadRequestException('Del libro y al libro deben ser numeros enteros');
    }

    if (delLibro > alLibro) {
      throw new BadRequestException('El rango de libros es invalido');
    }

    const idNum = Number(parroqusiaId);
    const config = this.getSacramentoConfig(sacramento);
    const rows = await config.fetch(idNum);

    const data = rows
      .map(config.map)
      .filter((item: any) => {
        const libroNumber = this.toLibroNumber(item.libro);
        if (libroNumber === null) return false;
        return libroNumber >= delLibro && libroNumber <= alLibro;
      })
      .sort((a: any, b: any) => {
        const libroA = this.toLibroNumber(a.libro) || 0;
        const libroB = this.toLibroNumber(b.libro) || 0;
        if (libroA !== libroB) return libroA - libroB;

        const folioA = this.toLibroNumber(a.folio) || 0;
        const folioB = this.toLibroNumber(b.folio) || 0;
        if (folioA !== folioB) return folioA - folioB;

        const numeroA = this.toLibroNumber(a.numero) || 0;
        const numeroB = this.toLibroNumber(b.numero) || 0;
        return numeroA - numeroB;
      });

    return {
      sacramento: config.label,
      delLibro,
      alLibro,
      total: data.length,
      data,
    };
  }

  async getIndicesData(
    parroqusiaId: string,
    sacramento: string,
    delLibroRaw: string,
    alLibroRaw: string,
    usuario: any,
  ) {
    const result = await this.getIndices(parroqusiaId, sacramento, delLibroRaw, alLibroRaw, usuario);
    return result.data;
  }

  async exportToExcel(data: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Libro: item.libro,
        Folio: item.folio,
        Numero: item.numero,
        Nombre: item.nombre,
        Fecha: item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '',
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Indice');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as any;
  }

  async exportToPdf(data: any[], sacramento: string) {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text(`Indice de ${sacramento}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);

      const tableTop = doc.y;
      const colWidths = [40, 40, 40, 150, 80];
      const headers = ['Libro', 'Folio', 'Numero', 'Nombre', 'Fecha'];

      let y = tableTop;
      doc.font('Helvetica-Bold').fontSize(8);
      let x = 50;
      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 15;

      doc.font('Helvetica').fontSize(8);
      data.forEach((item) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }
        x = 50;
        const row = [
          String(item.libro || ''),
          String(item.folio || ''),
          String(item.numero || ''),
          item.nombre || '',
          item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '',
        ];
        row.forEach((cell, i) => {
          doc.text(cell, x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        y += 12;
      });

      doc.end();
    });
  }
}
