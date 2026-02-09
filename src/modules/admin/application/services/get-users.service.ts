import { Inject, Injectable } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type AdminUserDto,
} from '../../infrastructure';

@Injectable()
export class GetUsersService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(excludeUserId: string): Promise<AdminUserDto[]> {
    return this.adminRepository.getUsers(excludeUserId);
  }
}
