import type { user_status } from '@prisma/client';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName: string;
  status: user_status;
}

export interface CreateSessionData {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
}

export interface UserWithRoles {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  status: user_status;
  userRoles: Array<{
    roles: {
      code: string;
    };
  }>;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  status: user_status;
  role: string;
  displayName: string;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<UserWithRoles | null>;
  findUserById(id: string): Promise<UserWithRoles | null>;
  createUser(data: CreateUserData): Promise<{ id: string }>;
  updateUserStatus(userId: string, status: user_status): Promise<void>;
  createDefaultUserLists(userId: string): Promise<void>;
  assignUserRole(userId: string, roleCode: string): Promise<void>;
  createSession(data: CreateSessionData): Promise<{ id: string }>;
  findSessionByRefreshToken(refreshToken: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
}
