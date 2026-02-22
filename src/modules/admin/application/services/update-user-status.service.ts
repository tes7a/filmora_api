import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type AdminUserDto,
  type UpdateUserStatusParams,
} from '../../infrastructure';

@Injectable()
export class UpdateUserStatusService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: UpdateUserStatusParams): Promise<AdminUserDto> {
    const user = await this.adminRepository.updateUserStatus(params);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
