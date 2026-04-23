import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuienfirmaService } from './quienfirma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/quienfirma')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class QuienfirmaController {
  constructor(private quienfirmaService: QuienfirmaService) {}

  @Get()
  @Permission('usuarios', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.quienfirmaService.findAll(parroqusiaId, req.user);
  }

  @Get(':id')
  @Permission('usuarios', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.quienfirmaService.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('usuarios', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre: string }, @Request() req: any) {
    return this.quienfirmaService.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('usuarios', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre?: string }, @Request() req: any) {
    return this.quienfirmaService.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('usuarios', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.quienfirmaService.delete(id, parroqusiaId, req.user);
  }

  @Post(':id/firmantes')
  @Permission('usuarios', 'crear')
  createFirmante(
    @Param('id') id: string,
    @Param('parroqusiaId') parroqusiaId: string,
    @Body() data: { nombre: string },
    @Request() req: any
  ) {
    return this.quienfirmaService.createFirmante(id, parroqusiaId, data, req.user);
  }

  @Put(':id/firmantes/:firmanteId')
  @Permission('usuarios', 'editar')
  updateFirmante(
    @Param('id') id: string,
    @Param('firmanteId') firmanteId: string,
    @Param('parroqusiaId') parroqusiaId: string,
    @Body() data: { nombre?: string },
    @Request() req: any
  ) {
    return this.quienfirmaService.updateFirmante(firmanteId, id, parroqusiaId, data, req.user);
  }

  @Delete(':id/firmantes/:firmanteId')
  @Permission('usuarios', 'eliminar')
  deleteFirmante(
    @Param('id') id: string,
    @Param('firmanteId') firmanteId: string,
    @Param('parroqusiaId') parroqusiaId: string,
    @Request() req: any
  ) {
    return this.quienfirmaService.deleteFirmante(firmanteId, id, parroqusiaId, req.user);
  }
}
