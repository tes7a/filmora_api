import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CreateComplaintService } from './application';
import { COMPLAINTS_REPOSITORY, PrismaComplaintsRepository } from './infrastructure';
import { ComplaintsController } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [ComplaintsController],
  providers: [
    CreateComplaintService,
    {
      provide: COMPLAINTS_REPOSITORY,
      useClass: PrismaComplaintsRepository,
    },
  ],
  exports: [],
})
export class ComplaintsModule {}
