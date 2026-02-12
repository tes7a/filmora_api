import { ApiProperty } from '@nestjs/swagger';
import { user_status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: user_status,
    example: user_status.blocked,
    description: 'New user status',
  })
  @IsEnum(user_status)
  status: user_status;
}
