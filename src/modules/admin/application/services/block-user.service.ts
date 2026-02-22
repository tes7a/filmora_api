import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type BlockUserParams,
  type ModerationActionDto,
} from '../../infrastructure';

@Injectable()
export class BlockUserService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: BlockUserParams): Promise<ModerationActionDto> {
    const action = await this.adminRepository.blockUser(params);

    if (!action) {
      throw new NotFoundException('User not found');
    }

    return action;
  }
}
