import { Module, forwardRef } from '@nestjs/common';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGPTModule } from '../chatgpt/chatgpt.module';

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => ChatGPTModule)
  ],
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
})
export class FlowsModule {}


