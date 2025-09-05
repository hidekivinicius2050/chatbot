import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TVBrandsController } from './tv-brands.controller';
import { TVBrandsService } from './tv-brands.service';

@Module({
  imports: [PrismaModule],
  controllers: [TVBrandsController],
  providers: [TVBrandsService],
  exports: [TVBrandsService],
})
export class TVBrandsModule {}
