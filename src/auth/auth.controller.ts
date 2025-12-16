import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation } from '@nestjs/swagger';
import { type Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @ApiOperation({
    summary: 'Регистрация пользователя',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: true,
      maxAge: 24 * 60 * 60 * 7 * 1000,
    });

    return res.json({
      accessToken,
    });
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
