import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/usuarios')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Permission('usuarios', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.usuariosService.findAll(parroqusiaId, req.user);
  }

  @Get(':id')
  @Permission('usuarios', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.usuariosService.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('usuarios', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre: string; email: string; password: string; perfilId: string }, @Request() req: any) {
    return this.usuariosService.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('usuarios', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Body() data: { nombre?: string; email?: string; password?: string; perfilId?: string; activo?: boolean }, @Request() req: any) {
    return this.usuariosService.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('usuarios', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.usuariosService.delete(id, parroqusiaId, req.user);
  }
}
