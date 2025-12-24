import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { UserResponseDto } from '../dto/user-response.dto';

export const UserRequest = createParamDecorator<keyof UserResponseDto>(
  (data, context) => {
    const request = context.switchToHttp().getRequest() as Request;

    const user = request.user as UserResponseDto;

    return data ? user[data] : user;
  },
);
