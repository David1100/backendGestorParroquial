import { Module } from '@nestjs/common';
import { DonacionesService } from './donaciones.service';
import { DonacionesController } from './donaciones.controller';

@Module({
  controllers: [DonacionesController],
  providers: [DonacionesService],
  exports: [DonacionesService],
})
export class DonacionesModule {}
