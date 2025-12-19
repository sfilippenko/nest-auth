import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT токен доступа',
  })
  accessToken: string;
}
