import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type ComplaintDto,
  COMPLAINTS_REPOSITORY,
  type ComplaintsRepository,
  type CreateComplaintParams,
} from '../../infrastructure';

@Injectable()
export class CreateComplaintService {
  constructor(
    @Inject(COMPLAINTS_REPOSITORY)
    private readonly complaintsRepository: ComplaintsRepository,
  ) {}

  async execute(params: CreateComplaintParams): Promise<ComplaintDto> {
    const complaint = await this.complaintsRepository.createComplaint(params);

    if (!complaint) {
      throw new NotFoundException('Target not found');
    }

    return complaint;
  }
}
