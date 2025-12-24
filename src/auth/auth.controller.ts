import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthTokenResponseDto } from './dto/auth.response.dto';
import { JwtGuard } from './guards/jwt.guard';
import { UserRequest } from './decorators/user-request.decorator';
import { type User } from 'generated/prisma/client';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Обновить пару токенов',
  })
  @ApiOkResponse({
    type: AuthTokenResponseDto,
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { refreshToken, accessToken } = await this.authService.refresh(
      request.signedCookies.refreshToken,
    );
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({
    summary: 'Регистрация пользователя',
  })
  @ApiOkResponse({
    type: AuthTokenResponseDto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
    };
  }

  @ApiOperation({
    summary: 'Логин пользователя',
  })
  @ApiOkResponse({
    type: AuthTokenResponseDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
    };
  }

  @ApiOperation({
    summary: 'Логаут пользователя',
    description: 'Удаление рефреш токена из куки',
  })
  @ApiOkResponse({
    type: Boolean,
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      signed: true,
    });

    return true;
  }

  @ApiOperation({
    summary: 'Получить свои данные',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @UseGuards(JwtGuard)
  @Get('my-profile')
  getMyProfile(@UserRequest() user: UserResponseDto) {
    return user;
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: true,
      maxAge: 24 * 60 * 60 * 7 * 1000,
      signed: true,
    });
  }
}
