import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from 'src/dtos/send-message.dto';
import { MessageService } from 'src/services/message/message.service';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private userSocketMap = new Map<string, Set<string>>();

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return client.disconnect();

    const sockets = this.userSocketMap.get(userId) || new Set();
    sockets.add(client.id);
    this.userSocketMap.set(userId, sockets);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSocketMap.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.create(data);

    const sockets = this.userSocketMap.get(data.toUserId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('receive_message', message);
      });
    }

    client.emit('message_sent', message);

    this.messageService.notifyReceiver(message);
  }

  emitToUser(userId: string, message: any) {
    const sockets = this.userSocketMap.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('receive_message', message);
      });
    }
  }
}
