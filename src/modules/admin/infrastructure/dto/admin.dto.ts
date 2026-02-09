import type { user_status } from '@prisma/client';

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string;
  status: user_status;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  roles: string[];
}
