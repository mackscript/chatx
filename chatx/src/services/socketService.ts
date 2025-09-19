import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

export interface MessageStatus {
  sent: boolean;
  delivered: boolean;
  read: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  deliveredTo: string[];
  readBy: string[];
}

export interface ReplyTo {
  messageId: string;
  message: string;
  user: string;
}

export interface Message {
  _id: string;
  message: string;
  user: string;
  room: string;
  timestamp: string;
  socketId?: string;
  status?: MessageStatus;
  replyTo?: ReplyTo;
  messageType?: 'text' | 'image';
  imageUrl?: string;
  imageData?: string; // Base64 image data
}

export interface OnlineUser {
  socketId: string;
  username: string;
}

export interface SocketEvents {
  receive_message: (message: Message) => void;
  user_joined: (data: {
    message: string;
    timestamp: string;
    type: string;
  }) => void;
  user_left: (data: {
    message: string;
    timestamp: string;
    type: string;
  }) => void;
  user_typing: (data: {
    user: string;
    isTyping: boolean;
    socketId: string;
  }) => void;
  room_users_updated: (data: { users: OnlineUser[]; count: number }) => void;
  message_delivered: (data: {
    messageId: string;
    deliveredTo: string[];
    deliveredAt: string;
  }) => void;
  message_read: (data: {
    messageId: string;
    readBy: string;
    readAt: string;
    originalSender: string;
  }) => void;
  error: (error: { message: string; error?: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = SOCKET_URL;

  connect(): Socket {
    if (!this.socket) {
      console.log('🔌 Attempting to connect to:', this.serverUrl);
      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"], // Add polling as fallback for production
        autoConnect: true,
        timeout: 20000, // 20 second timeout
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.serverUrl);
        console.log('🔌 Socket ID:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.socket = null;
      });

      this.socket.on('error', (error: any) => {
        console.error('❌ Socket error:', error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        if (error.message) {
          console.error(`❌ Error message: ${error.message}`);
          // Don't use alert in production, just log
          if (!window.location.hostname.includes('nextyfine.com')) {
            alert(`Error: ${error.message}`);
          }
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
        console.error("❌ Failed to connect to:", this.serverUrl);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Reconnected after", attemptNumber, "attempts");
      });

      this.socket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection failed:", error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string, username: string): void {
    if (this.socket) {
      this.socket.emit("join_room", { room, username });
    }
  }

  sendMessage(messageData: {
    message: string;
    user: string;
    room: string;
    messageType?: "text" | "image";
    imageData?: string;
    replyTo?: {
      messageId: string;
      message: string;
      user: string;
    };
  }): void {
    if (this.socket) {
      console.log('📤 SocketService sending message:', {
        user: messageData.user,
        room: messageData.room,
        messageType: messageData.messageType,
        hasImageData: !!messageData.imageData,
        hasReply: !!messageData.replyTo,
        connected: this.socket.connected,
        socketId: this.socket.id
      });

      if (!this.socket.connected) {
        console.error('❌ Socket not connected! Cannot send message');
        return;
      }

      if (messageData.messageType === 'image') {
        console.log('🖼️ Sending image message with size:', 
          messageData.imageData ? (messageData.imageData.length / (1024 * 1024)).toFixed(2) + 'MB' : 'No image data');
      }

      this.socket.emit("send_message", messageData);
      console.log('✅ Message emitted to server');
    } else {
      console.error('❌ No socket connection available');
    }
  }

  sendTyping(data: { user: string; room: string; isTyping: boolean }): void {
    if (this.socket) {
      this.socket.emit("typing", data);
    }
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on("receive_message", callback);
    }
  }

  onUserJoined(callback: (data: {
    message: string;
    timestamp: string;
    type: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on("user_joined", callback);
    }
  }

  onUserLeft(callback: (data: {
    message: string;
    timestamp: string;
    type: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on("user_left", callback);
    }
  }

  onUserTyping(
    callback: (data: {
      user: string;
      isTyping: boolean;
      socketId: string;
    }) => void,
  ): void {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onRoomUsersUpdated(
    callback: (data: { users: OnlineUser[]; count: number }) => void,
  ): void {
    if (this.socket) {
      this.socket.on("room_users_updated", callback);
    }
  }

  onError(callback: (error: { message: string; error?: string }) => void): void {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }

  // Message status event handlers
  onMessageDelivered(callback: (data: {
    messageId: string;
    deliveredTo: string[];
    deliveredAt: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on("message_delivered", callback);
    }
  }

  onMessageRead(callback: (data: {
    messageId: string;
    readBy: string;
    readAt: string;
    originalSender: string;
  }) => void): void {
    if (this.socket) {
      this.socket.on("message_read", callback);
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit("mark_message_read", { messageId, userId });
    }
  }

  // Mark multiple messages as read (bulk operation)
  markMessagesAsReadBulk(messageIds: string[], userId: string): void {
    if (this.socket) {
      this.socket.emit("mark_messages_read_bulk", { messageIds, userId });
    }
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
