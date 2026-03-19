import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BautizosService } from './bautizos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/bautizos')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BautizosController {
  constructor(private bautizosService: BautizosService) {}

  @Get()
  @Permission('bautizos', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.bautizosService.findAll(parroqusiaId, req.user);
  }

  @Get(':id')
  @Permission('bautizos', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.bautizosService.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('bautizos', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: any, @Request() req: any) {
    return this.bautizosService.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('bautizos', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Body() data: any, @Request() req: any) {
    return this.bautizosService.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('bautizos', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.bautizosService.delete(id, parroqusiaId, req.user);
  }
}
