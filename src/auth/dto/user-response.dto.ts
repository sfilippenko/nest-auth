import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Id пользователя',
  })
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
  })
  name: string;

  @ApiProperty({
    description: 'Email пользователя',
  })
  email: string;
}
