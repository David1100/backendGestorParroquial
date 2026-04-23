import { Module } from '@nestjs/common';
import { QuienfirmaService } from './quienfirma.service';
import { QuienfirmaController } from './quienfirma.controller';

@Module({
  controllers: [QuienfirmaController],
  providers: [QuienfirmaService],
})
export class QuienfirmaModule {}
