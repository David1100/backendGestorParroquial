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
      margins: { top: 60, bottom: 60, left: 90, right: 40 },
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
      sujeto: this.obtenerNombrePrincipal(tipo, registro),
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
      margins: { top: 60, bottom: 60, left: 90, right: 40 },
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
      sujeto: this.obtenerNombrePrincipal(tipo, registro),
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

  private obtenerNombrePrincipal(tipo: string, registro: any) {
    if (!registro) {
      return 'N/D';
    }

    switch (tipo) {
      case 'matrimonios': {
        const partes = [registro?.nombreNovio, registro?.nombreNovia].filter(Boolean) as string[];
        if (partes.length === 0) {
          return 'N/D';
        }
        if (partes.length === 1) {
          return partes[0];
        }
        return `${partes[0]} y ${partes[1]}`;
      }
      default:
        return registro?.nombre || 'N/D';
    }
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
    sujeto?: string;
  }) {
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    let currentY = doc.page.margins.top;
    const blockGap = 18;
    const writeBlock = (
      text: string,
      options: { font?: string; size?: number; align?: 'left' | 'right' | 'center' | 'justify'; lineGap?: number; extraGap?: number } = {},
    ) => {
      const { font = 'Times-Roman', size = 11, align = 'left', lineGap = 4, extraGap = 0 } = options;
      doc.font(font).fontSize(size);
      doc.text(text, left, currentY, {
        width,
        align,
        lineGap,
      });
      currentY = doc.y + extraGap;
    };


    // Nombre de parroquia y título centrado
    writeBlock((opciones.parroquia || '').toUpperCase(), {
      font: 'Times-Bold',
      size: 13,
      align: 'center',
      extraGap: 4,
    });
    writeBlock(`PARTIDA DE ${opciones.titulo.toUpperCase()}`, {
      font: 'Times-Bold',
      size: 12,
      align: 'center',
      extraGap: blockGap,
    });

    // Datos de libro/folio/número
    const detallesLineas = [
      `Libro: ${opciones.libro || 'N/D'}`,
      `Folio: ${opciones.folio || 'N/D'}`,
      `Número: ${opciones.numero || 'N/D'}`,
    ];

    const detalles = detallesLineas.join('\n');
    writeBlock(detalles, {
      font: 'Times-Roman',
      size: 11,
      align: 'left',
      extraGap: blockGap,
      lineGap: 6,
    });

    // Contenido principal
    const cuerpo = opciones.contenido?.trim() ? `"${opciones.contenido.trim()}"` : '""';
    writeBlock(cuerpo, {
      font: 'Times-Roman',
      size: 11,
      align: 'justify',
      lineGap: 6,
      extraGap: blockGap,
    });

    // Espacio para firma y notas
    doc.font('Times-Roman').fontSize(11);
    doc.text('..................................................................................', left, currentY, {
      width,
      align: 'center',
    });
    currentY = doc.y + 6;

    if (opciones.firmante) {
      writeBlock(opciones.firmante, {
        font: 'Times-Bold',
        size: 11,
        align: 'center',
        extraGap: 2,
      });
    }

    if (opciones.rol) {
      writeBlock(opciones.rol, {
        font: 'Times-Roman',
        size: 10,
        align: 'center'
      });
    }

    doc.y = currentY + 10;
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
