import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT 리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: '사용자 정보',
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: '사용자 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      email: {
        type: 'string',
        description: '사용자 이메일',
        example: 'user@example.com',
      },
      nickname: {
        type: 'string',
        description: '사용자 닉네임',
        example: '탈모탈출러',
      },
      role: {
        type: 'string',
        description: '사용자 역할',
        example: 'user',
        enum: ['user', 'admin', 'expert'],
      },
    },
  })
  user: {
    user_id: string;
    email: string;
    nickname: string;
    role: string;
  };
}
