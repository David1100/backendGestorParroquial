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

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 70, right: 70 },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const { contenidoPlano, meta } = this.prepararContenidoEspecial(bautizo.contenidoEspecial);
    this.renderFormatoEspecial(doc, {
      parroquia: parroquia.nombre,
      titulo: this.obtenerTituloPartida(tipo),
      libro: registro?.libro,
      folio: registro?.folio,
      numero: registro?.numero,
      contenido: contenidoPlano,
      firmante: meta.firmante,
      rol: meta.rol,
      seccion: this.obtenerEtiquetaSeccion(tipo),
    });

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generarPdfEspecialConContenido(parroqusiaId: string, tipo: string, id: string, usuario: any, contenido: string) {
    const idParroquia = Number(parroqusiaId);
    this.validarAcceso(idParroquia, usuario);

    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: idParroquia } });
    const registro = await this.obtenerRegistroConContenido(tipo, Number(id), idParroquia);

    if (!parroquia || !registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 70, right: 70 },
    });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const { contenidoPlano, meta } = this.prepararContenidoEspecial(contenido);
    this.renderFormatoEspecial(doc, {
      parroquia: parroquia.nombre,
      titulo: this.obtenerTituloPartida(tipo),
      libro: registro?.libro,
      folio: registro?.folio,
      numero: registro?.numero,
      contenido: contenidoPlano,
      firmante: meta.firmante,
      rol: meta.rol,
      seccion: this.obtenerEtiquetaSeccion(tipo),
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

  private obtenerTituloPartida(tipo: string) {
    switch (tipo) {
      case 'bautizos':
        return 'Bautizo';
      case 'comuniones':
        return 'Comunión';
      case 'confirmaciones':
        return 'Confirmación';
      case 'matrimonios':
        return 'Matrimonio';
      case 'difuntos':
        return 'Defunción';
      default:
        return tipo.slice(0, -1);
    }
  }

  private prepararContenidoEspecial(contenido: string) {
    const normalizado = contenido.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lineas = normalizado.split('\n');
    let seccionesSaltadas = 0;
    let indiceInicio = 0;
    let bloqueActualTieneTexto = false;

    for (let i = 0; i < lineas.length; i++) {
      const valor = lineas[i].trim();
      if (valor) {
        bloqueActualTieneTexto = true;
        continue;
      }

      if (!valor && bloqueActualTieneTexto) {
        seccionesSaltadas += 1;
        bloqueActualTieneTexto = false;
        if (seccionesSaltadas === 2) {
          indiceInicio = i + 1;
          break;
        }
      }
    }

    const cuerpoBruto = lineas.slice(indiceInicio);
    const meta: Record<string, string> = {};
    const cuerpoFiltrado: string[] = [];

    for (const linea of cuerpoBruto) {
      const limpia = linea.trim();
      if (!limpia) {
        if (cuerpoFiltrado.length === 0 || cuerpoFiltrado[cuerpoFiltrado.length - 1].trim() === '') {
          continue;
        }
        cuerpoFiltrado.push('');
        continue;
      }

      const coincidencia = limpia.match(/^(rol|firmante)\s*:\s*(.+)$/i);
      if (coincidencia) {
        meta[coincidencia[1].toLowerCase()] = coincidencia[2];
        continue;
      }

      cuerpoFiltrado.push(linea.replace(/\s+$/g, ''));
    }

    return {
      contenidoPlano: cuerpoFiltrado.join('\n'),
      meta,
    };
  }

  private renderFormatoEspecial(doc: any, opciones: {
    parroquia: string;
    titulo: string;
    libro?: string | null;
    folio?: string | null;
    numero?: string | null;
    contenido: string;
    firmante?: string;
    rol?: string;
    seccion?: string;
  }) {
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const padding = 10;
    const colLeft = width * 0.35;
    const colRight = width - colLeft;
    let currentY = doc.page.margins.top;

    const drawCell = (x: number, y: number, w: number, h: number) => {
      doc.save();
      doc.lineWidth(1);
      doc.rect(x, y, w, h).stroke();
      doc.restore();
    };

    const drawText = (text: string, x: number, y: number, w: number, h: number, options: any = {}) => {
      const prevX = doc.x;
      const prevY = doc.y;
      doc.text(text, x + padding, y + padding, { width: w - padding * 2, ...options });
      doc.x = prevX;
      doc.y = prevY;
    };

    const sectionLabel = opciones.seccion || 'Detalle';

    // Row 1: parroquia y título
    const row1Height = 70;
    drawCell(left, currentY, colLeft, row1Height);
    drawCell(left + colLeft, currentY, colRight, row1Height);
    doc.font('Times-Bold').fontSize(12);
    drawText((opciones.parroquia || '').toUpperCase(), left + colLeft, currentY, colRight, row1Height / 2, { align: 'center' });
    drawText(`PARTIDA DE ${opciones.titulo.toUpperCase()}`, left + colLeft, currentY + row1Height / 2 - 5, colRight, row1Height / 2, { align: 'center' });
    currentY += row1Height;

    // Row 2: datos libro/folio/numero
    const row2Height = 60;
    drawCell(left, currentY, colLeft, row2Height);
    drawCell(left + colLeft, currentY, colRight, row2Height);
    doc.font('Times-Roman').fontSize(11);
    const infoTexto = `Libro: ${opciones.libro || 'N/D'}\nFolio: ${opciones.folio || 'N/D'}\nNúmero: ${opciones.numero || 'N/D'}`;
    drawText(infoTexto, left + colLeft, currentY, colRight, row2Height, { align: 'left' });
    currentY += row2Height;

    // Row 3: etiqueta seccion
    const row3Height = 30;
    drawCell(left, currentY, width, row3Height);
    doc.font('Times-Bold').fontSize(11);
    drawText(sectionLabel.toUpperCase(), left, currentY, width, row3Height, { align: 'center' });
    currentY += row3Height;

    // Row 4: contenido principal
    doc.font('Times-Roman').fontSize(11);
    const contenidoHeight = doc.heightOfString(opciones.contenido, {
      width: width - padding * 2,
      align: 'justify',
      lineGap: 6,
    });
    const row4Height = contenidoHeight + padding * 2;
    drawCell(left, currentY, width, row4Height);
    drawText(opciones.contenido, left, currentY, width, row4Height, {
      align: 'justify',
      lineGap: 6,
    });
    currentY += row4Height;

    // Row 5: firma
    const row5Height = 90;
    drawCell(left, currentY, width, row5Height);
    const firmaLineaY = currentY + row5Height / 2;
    doc.font('Times-Roman').fontSize(11);
    drawText('..................................................................................', left, firmaLineaY - 20, width, 20, { align: 'center' });
    if (opciones.firmante) {
      doc.font('Times-Bold').fontSize(11);
      drawText(opciones.firmante, left, firmaLineaY, width, 20, { align: 'center' });
    }
    if (opciones.rol) {
      doc.font('Times-Roman').fontSize(10);
      drawText(opciones.rol, left, firmaLineaY + 15, width, 20, { align: 'center' });
    }
    currentY += row5Height;

    doc.y = currentY + 20;
  }

  private obtenerEtiquetaSeccion(tipo: string) {
    switch (tipo) {
      case 'bautizos':
        return 'Bautizado';
      case 'comuniones':
        return 'Comulgante';
      case 'confirmaciones':
        return 'Confirmado';
      case 'matrimonios':
        return 'Novios';
      case 'difuntos':
        return 'Difunto';
      default:
        return 'Detalle';
    }
  }
}
