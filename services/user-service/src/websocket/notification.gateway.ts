import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface UserSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'user-id'],
  },
  allowEIO3: true,
  namespace: '/',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userConnections = new Map<string, string>(); // userId -> socketId
  private socketUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: UserSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: UserSocket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userConnections.delete(userId);
      this.socketUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
      
      // Broadcast user status change to companions
      this.broadcastUserStatusChange(userId, 'offline');
    }
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: UserSocket,
  ) {
    const { userId } = data;
    
    console.log(`🔔 [NotificationGateway] User ${userId} joining with socket ${client.id}`);
    
    // Remove old connection if exists
    const oldSocketId = this.userConnections.get(userId);
    if (oldSocketId) {
      this.socketUsers.delete(oldSocketId);
      console.log(`🔔 [NotificationGateway] Removed old connection for user ${userId}`);
    }
    
    // Store new connection
    this.userConnections.set(userId, client.id);
    this.socketUsers.set(client.id, userId);
    client.userId = userId;
    
    // Join user-specific room
    client.join(`user:${userId}`);
    
    console.log(`🔔 [NotificationGateway] User ${userId} joined successfully. Total users: ${this.userConnections.size}`);
    
    // Broadcast user status change to companions
    this.broadcastUserStatusChange(userId, 'online');
    
    return { status: 'success', message: 'Joined successfully' };
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    console.log(`🔔 [NotificationGateway] Sending notification to user ${userId}:`, notification);
    console.log(`🔔 [NotificationGateway] User connected?`, this.userConnections.has(userId));
    console.log(`🔔 [NotificationGateway] Total connected users:`, this.userConnections.size);
    
    // Choose the right event based on notification type
    if (notification.type === 'companion_invitation') {
      this.server.to(`user:${userId}`).emit('new_invitation', notification);
    } else {
      this.server.to(`user:${userId}`).emit('notification', notification);
    }
  }

  // Send invitation notification
  sendInvitationNotification(userId: string, invitation: any) {
    this.logger.log(`Sending invitation to user ${userId}:`, invitation);
    this.server.to(`user:${userId}`).emit('new_invitation', invitation);
  }

  // Broadcast invitation accepted
  broadcastInvitationAccepted(userIds: string[], data: any) {
    userIds.forEach(userId => {
      this.logger.log(`Broadcasting invitation accepted to user ${userId}`);
      this.server.to(`user:${userId}`).emit('invitation_accepted', data);
    });
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userConnections.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const isOnline = this.userConnections.has(userId);
    console.log(`🔍 [Gateway] Checking if user ${userId} is online: ${isOnline}`);
    console.log(`🔍 [Gateway] Current online users:`, Array.from(this.userConnections.keys()));
    return isOnline;
  }

  // Broadcast user status change to all companions
  broadcastUserStatusChange(userId: string, status: 'online' | 'offline') {
    this.logger.log(`Broadcasting status change for user ${userId}: ${status}`);
    
    // Emit to all connected users (they can filter on frontend if they're companions)
    this.server.emit('user_status_change', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Get all online user IDs
  getOnlineUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }
}