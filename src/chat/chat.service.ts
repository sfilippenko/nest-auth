import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    return this.prismaService.message.create({
      data: sendMessageDto,
    });
  }
}
