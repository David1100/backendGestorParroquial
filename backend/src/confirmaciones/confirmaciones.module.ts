import { Module } from '@nestjs/common';
import { ConfirmacionesService } from './confirmaciones.service';
import { ConfirmacionesController } from './confirmaciones.controller';

@Module({
  controllers: [ConfirmacionesController],
  providers: [ConfirmacionesService],
  exports: [ConfirmacionesService],
})
export class ConfirmacionesModule {}
