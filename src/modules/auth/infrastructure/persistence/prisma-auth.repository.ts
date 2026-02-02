import { Injectable } from '@nestjs/common';
import { code_role, list_type, user_status } from '@prisma/client';

import { PrismaService } from '@/shared';

import {
  AuthRepository,
  CreateSessionData,
  CreateUserData,
  UserWithRoles,
} from './auth.repository';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash,
      displayName: user.display_name,
      status: user.status,
      userRoles: user.user_roles.map((ur) => ({
        roles: { code: ur.roles.code },
      })),
    };
  }

  async findUserById(id: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash,
      displayName: user.display_name,
      status: user.status,
      userRoles: user.user_roles.map((ur) => ({
        roles: { code: ur.roles.code },
      })),
    };
  }

  async createUser(data: CreateUserData): Promise<{ id: string }> {
    const now = new Date();
    const user = await this.prisma.users.create({
      data: {
        email: data.email,
        password_hash: data.passwordHash,
        display_name: data.displayName,
        status: data.status,
        created_at: now,
        updated_at: now,
      },
      select: { id: true },
    });

    return user;
  }

  async updateUserStatus(userId: string, status: user_status): Promise<void> {
    await this.prisma.users.update({
      where: { id: userId },
      data: { status, updated_at: new Date() },
    });
  }

  async createDefaultUserLists(userId: string): Promise<void> {
    const now = new Date();
    await this.prisma.user_lists.createMany({
      data: [
        {
          user_id: userId,
          name: 'Watchlist',
          type: list_type.watchlist,
          is_public: false,
          created_at: now,
          updated_at: now,
        },
        {
          user_id: userId,
          name: 'Watched',
          type: list_type.watched,
          is_public: false,
          created_at: now,
          updated_at: now,
        },
      ],
    });
  }

  async assignUserRole(userId: string, roleCode: string): Promise<void> {
    const role = await this.prisma.roles.findFirst({
      where: { code: roleCode as code_role },
    });

    if (!role) {
      throw new Error(`Role with code "${roleCode}" not found`);
    }

    await this.prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: role.id,
        assigned_at: new Date(),
      },
    });
  }

  async createSession(data: CreateSessionData): Promise<{ id: string }> {
    const session = await this.prisma.auth_sessions.create({
      data: {
        user_id: data.userId,
        refresh_token: data.refreshToken,
        expires_at: data.expiresAt,
        ip: data.ip,
        user_agent: data.userAgent,
        created_at: new Date(),
      },
      select: { id: true },
    });

    return session;
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    const session = await this.prisma.auth_sessions.findUnique({
      where: { refresh_token: refreshToken },
    });

    if (!session) return null;

    return {
      id: session.id,
      userId: session.user_id,
      expiresAt: session.expires_at,
      revokedAt: session.revoked_at,
    };
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    const session = await this.prisma.auth_sessions.findUnique({
      where: { id: sessionId },
      select: { revoked_at: true, expires_at: true },
    });

    if (!session) return false;

    return session.revoked_at === null && session.expires_at > new Date();
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.auth_sessions.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.auth_sessions.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }
}
