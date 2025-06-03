import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INotificationPayload } from 'src/interfaces/INotificationContent';

@WebSocketGateway({ cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private userSocketMap = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    if (userId) {
      const isExist = this.userSocketMap.has(userId);

      isExist
        ? this.userSocketMap.set(userId, new Set())
        : this.userSocketMap.get(userId).add(client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSocketMap.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
        break;
      }
    }
  }

  emitToUser(userId: string, payload: INotificationPayload) {
    const sockets = this.userSocketMap.get(userId);

    if (sockets) {
      sockets.forEach((socket) => {
        this.server.to(socket).emit('notification', payload);
      });
    }
  }
}
