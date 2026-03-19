import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/perfiles/:perfilId/permisos')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermisosController {
  constructor(private permisosService: PermisosService) {}

  @Get()
  @Permission('perfiles', 'ver')
  findByPerfil(@Param('perfilId') perfilId: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.permisosService.findByPerfil(perfilId, parroqusiaId, req.user);
  }

  @Put()
  @Permission('perfiles', 'editar')
  update(
    @Param('perfilId') perfilId: string,
    @Param('parroqusiaId') parroqusiaId: string,
    @Body() permisos: Array<{ modulo: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }>,
    @Request() req: any,
  ) {
    return this.permisosService.update(perfilId, parroqusiaId, permisos, req.user);
  }
}
