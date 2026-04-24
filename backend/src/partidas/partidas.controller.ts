import { Controller, Get, Param, UseGuards, Request, Res, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';
import { PartidasService } from './partidas.service';

@Controller('parroquias/:parroqusiaId/partidas')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Get(':tipo/:id/pdf')
  @Permission('reportes', 'ver')
  async exportarPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('tipo') tipo: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarPdf(parroqusiaId, tipo, id, req.user);
    const filename = `partida-${tipo}-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get(':tipo/:id/pdf-especial')
  @Permission('reportes', 'ver')
  async exportarPdfEspecial(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('tipo') tipo: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarPdfEspecial(parroqusiaId, tipo, id, req.user);
    const filename = `nota-marginal-${tipo}-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Post(':tipo/:id/pdf-especial')
  @Permission('reportes', 'ver')
  async exportarPdfEspecialConContenido(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('tipo') tipo: string,
    @Param('id') id: string,
    @Body() body: { contenido: string },
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarPdfEspecialConContenido(parroqusiaId, tipo, id, req.user, body.contenido);
    const filename = `partida-${tipo}-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('bautizos/:id/recordatorio-pdf')
  @Permission('reportes', 'ver')
  async exportarRecordatorioPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarRecordatorioPdf(parroqusiaId, id, req.user);
    const filename = `recordatorio-bautizo-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('confirmaciones/:id/recordatorio-pdf')
  @Permission('reportes', 'ver')
  async exportarConfirmacionRecordatorioPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarConfirmacionRecordatorioPdf(parroqusiaId, id, req.user);
    const filename = `recordatorio-confirmacion-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('difuntos/:id/recordatorio-pdf')
  @Permission('reportes', 'ver')
  async exportarDifuntoRecordatorioPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarDifuntoRecordatorioPdf(parroqusiaId, id, req.user);
    const filename = `recordatorio-difunto-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('matrimonios/:id/aviso-novio-pdf')
  @Permission('reportes', 'ver')
  async exportarAvisoNovioPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarAvisoNovioPdf(parroqusiaId, id, req.user);
    const filename = `aviso-novio-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('matrimonios/:id/aviso-novia-pdf')
  @Permission('reportes', 'ver')
  async exportarAvisoNoviaPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarAvisoNoviaPdf(parroqusiaId, id, req.user);
    const filename = `aviso-novia-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }

  @Get('matrimonios/:id/acta-matrimonial-pdf')
  @Permission('reportes', 'ver')
  async exportarActaMatrimonialPdf(
    @Param('parroqusiaId') parroqusiaId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdf = await this.partidasService.generarActaMatrimonialPdf(parroqusiaId, id, req.user);
    const filename = `acta-matrimonial-${id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdf);
  }
}
