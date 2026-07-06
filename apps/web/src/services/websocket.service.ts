import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private isConnecting = false;

  connect(userId: string) {
    if (this.isConnecting || (this.socket?.connected && this.userId === userId)) {
      console.log('🔌 WebSocket already connected or connecting for user:', userId);
      return;
    }

    console.log('🔌 Connecting WebSocket for user:', userId);
    this.isConnecting = true;
    this.userId = userId;

    // Disconnect existing connection if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Connect to user-service WebSocket
    this.socket = io('http://localhost:3002', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected to user-service for user:', this.userId);
      // Join user-specific room
      this.socket?.emit('join', { userId });
      this.isConnecting = false;

      // Test connection
      console.log('✅ WebSocket connection established, socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 WebSocket disconnected:', reason);
      this.isConnecting = false;
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 WebSocket reconnected');
      // Re-join user room after reconnection
      this.socket?.emit('join', { userId: this.userId });
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isConnecting = false;
    }
  }

  // Listen for new invitations
  onNewInvitation(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_invitation', callback);
      return () => this.socket?.off('new_invitation', callback);
    }
    return () => { };
  }

  // Listen for general notifications
  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
      return () => this.socket?.off('notification', callback);
    }
    return () => { };
  }

  // Listen for invitation accepted
  onInvitationAccepted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('invitation_accepted', callback);
      return () => this.socket?.off('invitation_accepted', callback);
    }
    return () => { };
  }

  // Listen for user status changes
  onUserStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_status_change', callback);
      return () => this.socket?.off('user_status_change', callback);
    }
    return () => { };
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.userId;
  }

  // ✅ Listen for ALL booking notifications (hotel messages, agent responses, payment requests)
  onBookingPaymentRequest(callback: (data: any) => void) {
    if (this.socket) {
      console.log('📡 [WebSocket] Listening for all booking notifications');
      this.socket.on('notification', (data) => {
        console.log('📡 [WebSocket] Received notification:', data);
        // Pass ALL notifications to callback - let ChatPageContent filter
        callback(data);
      });
      return () => this.socket?.off('notification');
    }
    return () => { };
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;