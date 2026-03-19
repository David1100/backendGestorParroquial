import { Module } from '@nestjs/common';
import { MatrimoniosService } from './matrimonios.service';
import { MatrimoniosController } from './matrimonios.controller';

@Module({
  controllers: [MatrimoniosController],
  providers: [MatrimoniosService],
  exports: [MatrimoniosService],
})
export class MatrimoniosModule {}
