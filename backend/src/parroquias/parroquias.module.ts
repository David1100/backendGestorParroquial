import { Module } from '@nestjs/common';
import { ParroquiasService } from './parroquias.service';
import { ParroquiasController } from './parroquias.controller';

@Module({
  controllers: [ParroquiasController],
  providers: [ParroquiasService],
  exports: [ParroquiasService],
})
export class ParroquiasModule {}
