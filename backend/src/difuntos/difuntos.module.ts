import { Module } from '@nestjs/common';
import { DifuntosService } from './difuntos.service';
import { DifuntosController } from './difuntos.controller';

@Module({
  controllers: [DifuntosController],
  providers: [DifuntosService],
  exports: [DifuntosService],
})
export class DifuntosModule {}
