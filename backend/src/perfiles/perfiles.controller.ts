import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/perfiles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PerfilesController {
  constructor(private perfilesService: PerfilesService) {}

  @Get()
  @Permission('perfiles', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.perfilesService.findAll(parroqusiaId, req.user);
  }

  @Get(':id')
  @Permission('perfiles', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.perfilesService.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('perfiles', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre: string; descripcion?: string }, @Request() req: any) {
    return this.perfilesService.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('perfiles', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre?: string; descripcion?: string }, @Request() req: any) {
    return this.perfilesService.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('perfiles', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.perfilesService.delete(id, parroqusiaId, req.user);
  }
}
