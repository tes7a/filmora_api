import type { user_status } from '@prisma/client';

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
  sessionId: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  status: user_status;
  roles: string[];
  displayName: string;
}
