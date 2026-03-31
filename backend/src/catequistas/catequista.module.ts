import { Module } from '@nestjs/common';
import { CatequistaService } from './catequista.service';
import { CatequistaController } from './catequista.controller';

@Module({
  controllers: [CatequistaController],
  providers: [CatequistaService],
  exports: [CatequistaService],
})
export class CatequistaModule {}
