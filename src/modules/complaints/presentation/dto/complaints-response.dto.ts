import { ApiProperty } from '@nestjs/swagger';
import { complaint_status, target_type } from '@prisma/client';

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
