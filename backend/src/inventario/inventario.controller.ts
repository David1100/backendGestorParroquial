import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/inventario')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class InventarioController {
  constructor(private service: InventarioService) {}

  @Get()
  @Permission('inventario', 'ver')
  findAll(@Param('parroqusiaId') id: string, @Request() req: any) {
    return this.service.findAll(id, req.user);
  }

  @Get(':id')
  @Permission('inventario', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.findOne(id, pid, req.user);
  }

  @Post()
  @Permission('inventario', 'crear')
  create(@Param('parroqusiaId') id: string, @Body() data: any, @Request() req: any) {
    return this.service.create(id, data, req.user);
  }

  @Put(':id')
  @Permission('inventario', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Body() data: any, @Request() req: any) {
    return this.service.update(id, pid, data, req.user);
  }

  @Delete(':id')
  @Permission('inventario', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.delete(id, pid, req.user);
  }
}
