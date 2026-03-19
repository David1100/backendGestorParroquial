import { Module } from '@nestjs/common';
import { CatequesisService } from './catequesis.service';
import { CatequesisController } from './catequesis.controller';

@Module({
  controllers: [CatequesisController],
  providers: [CatequesisService],
  exports: [CatequesisService],
})
export class CatequesisModule {}
