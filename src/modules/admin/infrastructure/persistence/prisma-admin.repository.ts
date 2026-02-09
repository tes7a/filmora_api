import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared';

import type { AdminRepository } from './admin.repository';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(excludeUserId: string) {
    const users = await this.prisma.users.findMany({
      where: {
        id: { not: excludeUserId },
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        last_login_at: true,
        user_roles: {
          select: {
            roles: {
              select: {
                code: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      roles: user.user_roles.map((ur) => ur.roles.code),
    }));
  }
}
