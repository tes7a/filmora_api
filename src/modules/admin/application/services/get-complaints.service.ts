import { Inject, Injectable } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type GetComplaintsParams,
  type PaginatedComplaintsDto,
} from '../../infrastructure';

@Injectable()
export class GetComplaintsService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: GetComplaintsParams): Promise<PaginatedComplaintsDto> {
    return this.adminRepository.getComplaints(params);
  }
}
