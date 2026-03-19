import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ParroquiasService } from './parroquias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ParroquiasController {
  constructor(private parroqusiasService: ParroquiasService) {}

  @Get()
  @Permission('parroquias', 'ver')
  findAll(@Request() req: any) {
    return this.parroqusiasService.findAll(req.user);
  }

  @Get(':id')
  @Permission('parroquias', 'ver')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.parroqusiasService.findOne(id, req.user);
  }

  @Post()
  @Permission('parroquias', 'crear')
  create(@Body() data: {
    nombre: string;
    direccion?: string;
    telefono?: string;
    ciudad: string;
    adminNombre: string;
    adminEmail: string;
    adminPassword: string;
  }, @Request() req: any) {
    return this.parroqusiasService.create(data, req.user);
  }

  @Put(':id')
  @Permission('parroquias', 'editar')
  update(@Param('id') id: string, @Body() data: { nombre?: string; direccion?: string; telefono?: string; ciudad?: string }, @Request() req: any) {
    return this.parroqusiasService.update(id, data, req.user);
  }

  @Delete(':id')
  @Permission('parroquias', 'eliminar')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.parroqusiasService.delete(id, req.user);
  }
}
