import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument = require('pdfkit');

const SUPER_ADMIN_EMAIL = 'admin@parroquia.com';
const SUPER_ADMIN_PROFILE = 'Super Admin';

@Injectable()
export class PartidasService {
  constructor(private prisma: PrismaService) { }

  private validarAcceso(parroqusiaId: number, usuario: any) {
    const isSuperAdmin = usuario?.perfil?.nombre === SUPER_ADMIN_PROFILE || usuario?.email === SUPER_ADMIN_EMAIL;
    if (!isSuperAdmin && usuario?.parroqusiaId !== parroqusiaId) {
      throw new ForbiddenException('No tienes acceso a esta parroquia');
    }
  }

  private async obtenerRegistro(tipo: string, id: number, parroqusiaId: number) {
    if (tipo === 'bautizos') {
      return this.prisma.bautizo.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'comuniones') {
      return this.prisma.comunion.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'confirmaciones') {
      return this.prisma.confirmacion.findFirst({ where: { id, parroqusiaId: parroqusiaId } });
    }
    if (tipo === 'matrimonios') {
      return this.prisma.matrimonio.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'difuntos') {
      return this.prisma.difunto.findFirst({ where: { id, parroqusiaId } });
    }

    throw new NotFoundException('Tipo de partida no soportado');
  }

  private formatearFecha(valor: any) {
    if (!valor) return 'N/D';
    return new Date(valor).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private camposPorTipo(tipo: string, registro: any) {
    if (tipo === 'bautizos') {
      return [
        ['Nombre', registro.nombre],
        ['Fecha del sacramento', this.formatearFecha(registro.fecha)],
        ['Padre', registro.padre],
        ['Madre', registro.madre],
        ['Padrino', registro.padrino || 'N/D'],
        ['Madrina', registro.madrina || 'N/D'],
        ['Libro', registro.libro || 'N/D'],
        ['Folio', registro.folio || 'N/D'],
        ['Partida', registro.partida || 'N/D'],
      ];
    }
    if (tipo === 'confirmaciones') {
      return [
        ['Nombre', registro.nombre],
        ['Fecha del sacramento', this.formatearFecha(registro.fecha)],
        ['Padre', registro.padre],
        ['Madre', registro.madre],
        ['Padrino', registro.padrino || 'N/D'],
        ['Madrina', registro.madrina || 'N/D'],
        ['Confirmador', registro.confirmador || 'N/D'],
        ['Libro', registro.libro || 'N/D'],
        ['Folio', registro.folio || 'N/D'],
        ['Partida', registro.partida || 'N/D'],
      ];
    }
    if (tipo === 'matrimonios') {
      return [
        ['Novio', registro.nombreNovio],
        ['Novia', registro.nombreNovia],
        ['Fecha del sacramento', this.formatearFecha(registro.fecha)],
        ['Padre del novio', registro.padreNovio],
        ['Madre del novio', registro.madreNovio],
        ['Padre de la novia', registro.padreNovia],
        ['Madre de la novia', registro.madreNovia],
        ['Padrino', registro.padrino || 'N/D'],
        ['Madrina', registro.madrina || 'N/D'],
        ['Libro', registro.libro || 'N/D'],
        ['Folio', registro.folio || 'N/D'],
        ['Partida', registro.partida || 'N/D'],
      ];
    }

    return [
      ['Nombre', registro.nombre],
      ['Fallecimiento', this.formatearFecha(registro.fechaFallecimiento)],
      ['Entierro', this.formatearFecha(registro.fechaEntierro)],
      ['Esposa(o)', registro.esposa || 'N/D'],
      ['Padres', registro.padres || 'N/D'],
      ['Libro', registro.libro || 'N/D'],
      ['Folio', registro.folio || 'N/D'],
      ['Partida', registro.partida || 'N/D'],
    ];
  }

  async generarPdf(parroqusiaId: string, tipo: string, id: string, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: idParroquia } });
    const registro = await this.obtenerRegistro(tipo, Number(id), idParroquia);

    if (!parroquia || !registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(18).font('Helvetica-Bold').text('Sistema de Gestion Parroquial', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text(`Partida de ${tipo.slice(0, -1)}`, { align: 'center' });
    doc.moveDown(1.2);

    doc.fontSize(12).font('Helvetica').text(`Parroquia: ${parroquia.nombre}`);
    doc.text(`Ciudad: ${parroquia.ciudad}`);
    doc.text(`Fecha de emision: ${this.formatearFecha(new Date())}`);
    doc.moveDown();

    const campos = this.camposPorTipo(tipo, registro);
    for (const [label, value] of campos) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value || 'N/D');
    }

    doc.moveDown(2);
    doc.text('_______________________________', { align: 'center' });
    doc.text('Firma del parroco / secretaria', { align: 'center' });

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generarPdfEspecial(parroqusiaId: string, tipo: string, id: string, usuario: any) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: idParroquia } });
    const registro = await this.obtenerRegistroConContenido(tipo, Number(id), idParroquia);

    if (!parroquia || !registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const bautizo = registro as any;
    if (bautizo.tipoFormato !== 'especial' || !bautizo.contenidoEspecial) {
      throw new NotFoundException('Este registro no tiene formato especial');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(18).font('Helvetica-Bold').text('Nota Marginal', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text(`Partida de ${tipo.slice(0, -1)}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica').text(`Parroquia: ${parroquia.nombre}`);
    doc.text(`Ciudad: ${parroquia.ciudad}`);
    doc.text(`Fecha de emisión: ${this.formatearFecha(new Date())}`);
    doc.moveDown();

    doc.fontSize(11).font('Helvetica').text(bautizo.contenidoEspecial);

    doc.moveDown(2);
    doc.text('_______________________________', { align: 'center' });
    doc.text('Firma del párroco / secretaria', { align: 'center' });

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generarPdfEspecialConContenido(parroqusiaId: string, tipo: string, id: string, usuario: any, contenido: string) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: idParroquia } });

    if (!parroquia) {
      throw new NotFoundException('Parroquia no encontrada');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(12).font('Helvetica').text(contenido, {
      lineGap: 8,
      align: 'justify'
    });
    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private async obtenerRegistroConContenido(tipo: string, id: number, parroqusiaId: number) {
    if (tipo === 'bautizos') {
      return this.prisma.bautizo.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'comuniones') {
      return this.prisma.comunion.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'confirmaciones') {
      return this.prisma.confirmacion.findFirst({ where: { id, parroqusiaId: parroqusiaId } });
    }
    if (tipo === 'matrimonios') {
      return this.prisma.matrimonio.findFirst({ where: { id, parroqusiaId } });
    }
    if (tipo === 'difuntos') {
      return this.prisma.difunto.findFirst({ where: { id, parroqusiaId } });
    }

    throw new NotFoundException('Tipo de partida no soportado');
  }
}
