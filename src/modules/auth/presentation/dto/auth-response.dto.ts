import { ApiProperty } from '@nestjs/swagger';
import { user_status } from '@prisma/client';

export class LoginUserResponseDto {
  @ApiProperty({ example: 'clz9u9r5f0000is43n8t34k9f' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ type: [String], example: ['user'] })
  roles: string[];
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: LoginUserResponseDto })
  user: LoginUserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'clz9u9r5f0000is43n8t34k9f' })
  userId: string;

  @ApiProperty({
    example:
      'Registration successful. Please check your email to confirm your account.',
  })
  message: string;
}

export class ConfirmEmailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Email confirmed successfully' })
  message: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}

export class MeResponseDto {
  @ApiProperty({ example: 'clz9u9r5f0000is43n8t34k9f' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({
    enum: user_status,
    example: user_status.active,
  })
  status: user_status;

  @ApiProperty({ type: [String], example: ['user'] })
  roles: string[];

  @ApiProperty({ example: 'John Doe' })
  displayName: string;
}
