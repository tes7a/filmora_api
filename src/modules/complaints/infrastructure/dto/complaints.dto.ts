import type { complaint_status, target_type } from '@prisma/client';

export interface CreateComplaintParams {
  userId: string;
  targetType: target_type;
  targetId: string;
  reason: string;
}

export interface ComplaintDto {
  id: string;
  userId: string;
  targetType: target_type;
  targetId: string;
  reason: string;
  status: complaint_status;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}
