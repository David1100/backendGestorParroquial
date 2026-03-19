import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';
import { ComunionesService } from './comuniones.service';

@Controller('parroquias/:parroqusiaId/comuniones')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ComunionesController {
  constructor(private readonly comunionesService: ComunionesService) {}

  @Get()
  @Permission('comuniones', 'ver')
  findAll(@Param('parroqusiaId') parroqusiaId: string, @Request() req: any) {
    return this.comunionesService.findAll(parroqusiaId, req.user);
  }

  @Get(':id')
  @Permission('comuniones', 'ver')
  findOne(@Param('parroqusiaId') parroqusiaId: string, @Param('id') id: string, @Request() req: any) {
    return this.comunionesService.findOne(id, parroqusiaId, req.user);
  }

  @Post()
  @Permission('comuniones', 'crear')
  create(@Param('parroqusiaId') parroqusiaId: string, @Body() data: any, @Request() req: any) {
    return this.comunionesService.create(parroqusiaId, data, req.user);
  }

  @Put(':id')
  @Permission('comuniones', 'editar')
  update(@Param('parroqusiaId') parroqusiaId: string, @Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.comunionesService.update(id, parroqusiaId, data, req.user);
  }

  @Delete(':id')
  @Permission('comuniones', 'eliminar')
  delete(@Param('parroqusiaId') parroqusiaId: string, @Param('id') id: string, @Request() req: any) {
    return this.comunionesService.delete(id, parroqusiaId, req.user);
  }
}
