import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComunionesService } from './comuniones.service';
import { ComunionesController } from './comuniones.controller';

@Module({
  controllers: [ComunionesController],
  providers: [ComunionesService, PrismaService],
})
export class ComunionesModule {}
