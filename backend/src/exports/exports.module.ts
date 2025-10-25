import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
