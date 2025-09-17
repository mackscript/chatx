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

export interface Message {
  _id: string;
  message: string;
  user: string;
  room: string;
  timestamp: string;
  socketId?: string;
  status?: MessageStatus;
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
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("🔌 Connected to server:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("🔌 Disconnected from server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
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
  }): void {
    if (this.socket) {
      this.socket.emit("send_message", messageData);
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
