import { ApiProperty } from '@nestjs/swagger';
import { target_type } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({
    enum: target_type,
    example: target_type.review,
    description: 'Complaint target type',
  })
  @IsEnum(target_type)
  targetType: target_type;

  @ApiProperty({
    example: '538732b8-2b16-46e5-9a9a-b093fdb42558',
    description: 'Target id (review/comment)',
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({
    example: 'Contains hate speech and personal attacks',
    description: 'Complaint reason',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
