import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/citas')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CitasController {
  constructor(private readonly service: CitasService) {}

  @Get()
  @Permission('citas', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.service.findAll(parroqusiaId, req.user);
  }

  @Get('proximas/citas')
  @Permission('citas', 'ver')
  findProximas(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.service.findProximas(parroqusiaId, 120, req.user);
  }

  @Get(':id')
  @Permission('citas', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.service.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('citas', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: any, @Request() req: any) {
    return this.service.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('citas', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Body() data: any, @Request() req: any) {
    return this.service.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('citas', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.service.delete(id, parroqusiaId, req.user);
  }
}