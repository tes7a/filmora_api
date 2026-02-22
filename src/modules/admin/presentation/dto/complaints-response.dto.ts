import { ApiProperty } from '@nestjs/swagger';
import {
  action_type,
  comment_status,
  complaint_status,
  review_status,
  target_type,
  target_type_ext,
} from '@prisma/client';

export class ComplaintUserResponseDto {
  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  id: string;

  @ApiProperty({ example: 'neo_fan' })
  displayName: string;
}

export class ComplaintResponseDto {
  @ApiProperty({ example: 'f1729a2a-17a5-4df0-916e-f586a6f54c98' })
  id: string;

  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  userId: string;

  @ApiProperty({ enum: target_type, example: target_type.review })
  targetType: target_type;

  @ApiProperty({ example: '538732b8-2b16-46e5-9a9a-b093fdb42558' })
  targetId: string;

  @ApiProperty({ example: 'Contains hate speech and personal attacks' })
  reason: string;

  @ApiProperty({ enum: complaint_status, example: complaint_status.pending })
  status: complaint_status;

  @ApiProperty({ example: '2026-02-15T21:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-15T21:00:00.000Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-02-15T21:15:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  resolvedAt: Date | null;
}

export class ComplaintListItemResponseDto extends ComplaintResponseDto {
  @ApiProperty({ type: ComplaintUserResponseDto })
  user: ComplaintUserResponseDto;
}

export class PaginatedComplaintsResponseDto {
  @ApiProperty({ type: [ComplaintListItemResponseDto] })
  items: ComplaintListItemResponseDto[];

  @ApiProperty({ example: 250 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class ModerationActionResponseDto {
  @ApiProperty({ example: '2f084633-4444-4f1d-a3eb-cac4d6486b6e' })
  id: string;

  @ApiProperty({ example: 'f84317f2-0f9b-4de1-9f14-f3ac3f4fcf72' })
  moderatorId: string;

  @ApiProperty({ enum: target_type_ext, example: target_type_ext.review })
  targetType: target_type_ext;

  @ApiProperty({ example: '538732b8-2b16-46e5-9a9a-b093fdb42558' })
  targetId: string;

  @ApiProperty({ enum: action_type, example: action_type.hide_review })
  actionType: action_type;

  @ApiProperty({
    example: 'Violation of platform rules',
    nullable: true,
  })
  reason: string | null;

  @ApiProperty({
    example: 'f1729a2a-17a5-4df0-916e-f586a6f54c98',
    nullable: true,
  })
  complaintId: string | null;

  @ApiProperty({ example: '2026-02-15T21:15:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ enum: review_status, nullable: true })
  reviewStatus?: review_status;

  @ApiProperty({ enum: comment_status, nullable: true })
  commentStatus?: comment_status;
}
