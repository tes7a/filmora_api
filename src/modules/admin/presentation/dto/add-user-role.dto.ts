import { ApiProperty } from '@nestjs/swagger';
import { code_role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AddUserRoleDto {
  @ApiProperty({
    enum: code_role,
    example: code_role.moderator,
    description: 'Role code to assign',
  })
  @IsEnum(code_role)
  role: code_role;
}
