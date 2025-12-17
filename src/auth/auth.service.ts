import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, argon2id, verify } from 'argon2';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateTokens(userId: string) {
    const payload: JwtPayload = { userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_ACCESS_TOKEN_TTL',
        ),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_TOKEN_TTL',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    const existedUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existedUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: await hash(password, {
          type: argon2id, // Гибридный вариант - лучшая защита
          memoryCost: 2 ** 16, // 64 MB - защита от GPU атак
          timeCost: 3, // Можно увеличить до 5-10 если нужно
          parallelism: 1, // Обычно 1 достаточно
          hashLength: 32, // 32 байта достаточно
        }),
      },
    });

    return this.generateTokens(user.id);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isPasswordVerified = await verify(user.password, password);

    if (!isPasswordVerified) {
      throw new NotFoundException('User does not exist');
    }

    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Wrong refresh token');
    }

    if (!payload?.userId) {
      throw new UnauthorizedException('No id in token encoded');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('No user');
    }

    return this.generateTokens(user.id);
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
