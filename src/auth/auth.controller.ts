import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Обновить пару токенов',
  })
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken } = await this.authService.refresh(
      request.signedCookies.refreshToken,
    );
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({
    summary: 'Регистрация пользователя',
  })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      signed: true,
    });

    return {
      logout: true,
    };
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
