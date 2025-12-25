import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): any {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    console.log('client disconnected', client.id);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send')
  async handleMessage(@MessageBody() sendMessageDto: SendMessageDto) {
    const message = await this.chatService.sendMessage(sendMessageDto);
    this.server.emit('messages', message);

    return message;
  }
}
