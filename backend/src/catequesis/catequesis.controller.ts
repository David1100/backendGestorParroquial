import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CatequesisService } from './catequesis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('parroquias/:parroqusiaId/catequesis')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CatequesisController {
  constructor(private service: CatequesisService) {}

  @Get()
  @Permission('catequesis', 'ver')
  findAll(@Param('parroqusiaId') id: string, @Request() req: any) {
    return this.service.findAll(id, req.user);
  }

  @Get(':id')
  @Permission('catequesis', 'ver')
  findOne(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.findOne(id, pid, req.user);
  }

  @Post()
  @Permission('catequesis', 'crear')
  create(@Param('parroqusiaId') id: string, @Body() data: any, @Request() req: any) {
    return this.service.create(id, data, req.user);
  }

  @Put(':id')
  @Permission('catequesis', 'editar')
  update(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Body() data: any, @Request() req: any) {
    return this.service.update(id, pid, data, req.user);
  }

  @Delete(':id')
  @Permission('catequesis', 'eliminar')
  delete(@Param('id') id: string, @Param('parroqusiaId') pid: string, @Request() req: any) {
    return this.service.delete(id, pid, req.user);
  }
}
