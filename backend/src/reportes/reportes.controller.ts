import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

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
}
