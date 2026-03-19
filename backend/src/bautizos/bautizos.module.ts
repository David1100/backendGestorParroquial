import { Module } from '@nestjs/common';
import { BautizosService } from './bautizos.service';
import { BautizosController } from './bautizos.controller';

@Module({
  controllers: [BautizosController],
  providers: [BautizosService],
  exports: [BautizosService],
})
export class BautizosModule {}
