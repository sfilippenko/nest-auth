import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { email } = registerDto;

    const existedUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existedUser) {
      throw new ConflictException('User already exists');
    }

    return this.prismaService.user.create({
      data: registerDto,
    });
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
