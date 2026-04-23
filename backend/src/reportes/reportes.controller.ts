import { Controller, Get, Param, Query, Res, UseGuards, Request } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';
import { Response } from 'express';

@Controller('parroquias/:parroqusiaId/reportes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Get()
  @Permission('reportes', 'ver')
  getReportes(@Param('parroqusiaId') id: string, @Request() req: any) {
    return this.service.getReportes(id, req.user);
  }

  @Get('indices')
  @Permission('indices', 'ver')
  getIndices(
    @Param('parroqusiaId') id: string,
    @Query('sacramento') sacramento: string,
    @Query('delLibro') delLibro: string,
    @Query('alLibro') alLibro: string,
    @Request() req: any,
  ) {
    return this.service.getIndices(id, sacramento, delLibro, alLibro, req.user);
  }

  @Get('indices/export')
  @Permission('indices', 'ver')
  async exportIndices(
    @Param('parroqusiaId') id: string,
    @Query('formato') formato: string,
    @Query('sacramento') sacramento: string,
    @Query('delLibro') delLibro: string,
    @Query('alLibro') alLibro: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const data = await this.service.getIndicesData(id, sacramento, delLibro, alLibro, req.user);
    
    if (formato === 'excel') {
      const buffer = await this.service.exportToExcel(data);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=indice-${sacramento}.xlsx`,
      });
      return res.send(buffer);
    }
    
    const buffer = await this.service.exportToPdf(data, sacramento);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=indice-${sacramento}.pdf`,
    });
    return res.send(buffer);
  }
}
