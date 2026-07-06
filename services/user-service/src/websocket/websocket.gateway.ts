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
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications'
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from map when they disconnect
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.logger.log(`User ${userId} joined with socket ${client.id}`);
    this.userSockets.set(userId, client.id);
    client.join(`user_${userId}`);
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.logger.log(`User ${userId} left`);
    this.userSockets.delete(userId);
    client.leave(`user_${userId}`);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to user ${userId}:`, data);
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to multiple users
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => this.sendToUser(userId, event, data));
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.logger.log(`Broadcasting ${event}:`, data);
    this.server.emit(event, data);
  }
}