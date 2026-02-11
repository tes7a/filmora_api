import { Inject, Injectable } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type GetUsersParams,
  type PaginatedAdminUsersDto,
} from '../../infrastructure';

@Injectable()
export class GetUsersService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: GetUsersParams): Promise<PaginatedAdminUsersDto> {
    return this.adminRepository.getUsers(params);
  }
}
