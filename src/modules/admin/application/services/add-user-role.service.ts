import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type AddUserRoleParams,
  ADMIN_REPOSITORY,
  type AdminRepository,
  type AdminUserDto,
} from '../../infrastructure';

@Injectable()
export class AddUserRoleService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: AddUserRoleParams): Promise<AdminUserDto> {
    try {
      const user = await this.adminRepository.addUserRole(params);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'ROLE_NOT_FOUND') {
        throw new NotFoundException('Role not found');
      }

      if (error instanceof Error && error.message === 'ROLE_ALREADY_ASSIGNED') {
        throw new ConflictException('Role is already assigned to this user');
      }

      throw error;
    }
  }
}
