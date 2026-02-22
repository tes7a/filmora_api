import { Injectable } from '@nestjs/common';
import { complaint_status, target_type } from '@prisma/client';

import { PrismaService } from '@/shared';

import type { ComplaintDto, CreateComplaintParams } from '../dto';
import type { ComplaintsRepository } from './complaints.repository';

@Injectable()
export class PrismaComplaintsRepository implements ComplaintsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createComplaint(
    params: CreateComplaintParams,
  ): Promise<ComplaintDto | null> {
    const { userId, targetType, targetId, reason } = params;

    if (targetType === target_type.review) {
      const review = await this.prisma.reviews.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }
    }

    if (targetType === target_type.comment) {
      const comment = await this.prisma.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }
    }

    const complaint = await this.prisma.complaints.create({
      data: {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason,
        status: complaint_status.pending,
      },
      select: {
        id: true,
        user_id: true,
        target_type: true,
        target_id: true,
        reason: true,
        status: true,
        created_at: true,
        updated_at: true,
        resolved_at: true,
      },
    });

    return {
      id: complaint.id,
      userId: complaint.user_id,
      targetType: complaint.target_type,
      targetId: complaint.target_id,
      reason: complaint.reason,
      status: complaint.status,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at,
      resolvedAt: complaint.resolved_at,
    };
  }
}
