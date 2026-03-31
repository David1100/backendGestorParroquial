import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/grupos')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class GrupoController {
  constructor(private service: GrupoService) {}

  @Get()
  @Permission('grupos', 'ver')
  findAll(@Param('parroqusiaId') id: string, @Request() req: any) {
    return this.service.findAll(id, req.user);
  }

  @Get(':id')
  @Permission('grupos', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.findOne(id, pid, req.user);
  }

  @Post()
  @Permission('grupos', 'crear')
  create(@Param('parroqusiaId') id: string, @Body() data: any, @Request() req: any) {
    return this.service.create(id, data, req.user);
  }

  @Put(':id')
  @Permission('grupos', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Body() data: any, @Request() req: any) {
    return this.service.update(id, pid, data, req.user);
  }

  @Delete(':id')
  @Permission('grupos', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.delete(id, pid, req.user);
  }

  @Post(':id/catequistas')
  @Permission('grupos', 'editar')
  agregarCatequista(@Param('id') id: string, @Body() body: { catequistaId: number }, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.agregarCatequista(id, String(body.catequistaId), pid, req.user);
  }

  @Delete(':id/catequistas/:catequistaId')
  @Permission('grupos', 'editar')
  eliminarCatequista(@Param('id') id: string, @Param('catequistaId') cid: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.eliminarCatequista(id, cid, pid, req.user);
  }
}
