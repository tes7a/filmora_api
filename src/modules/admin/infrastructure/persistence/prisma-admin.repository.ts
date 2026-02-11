import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type { GetUsersParams } from '../dto';
import type { AdminRepository } from './admin.repository';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(params: GetUsersParams) {
    const { excludeUserId, page, limit, sortBy, sortOrder, search } = params;
    const skip = (page - 1) * limit;

    const sortMap = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastLoginAt: 'last_login_at',
      email: 'email',
      displayName: 'display_name',
      status: 'status',
    } as const;

    const where: Prisma.usersWhereInput = {
      id: { not: excludeUserId },
      ...(search
        ? {
            OR: [
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                display_name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
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
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        roles: user.user_roles.map((ur) => ur.roles.code),
      })),
      total,
      page,
      limit,
    };
  }
}
