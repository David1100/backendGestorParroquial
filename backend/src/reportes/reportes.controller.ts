import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
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
}
