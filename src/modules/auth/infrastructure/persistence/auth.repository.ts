import type { user_status } from '@prisma/client';

import type { CreateSessionData, CreateUserData, UserWithRoles } from '../dto';

export type {
  AuthenticatedUser,
  CreateSessionData,
  CreateUserData,
  JwtPayload,
  UserWithRoles,
} from '../dto';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

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
  isSessionActive(sessionId: string): Promise<boolean>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
}
