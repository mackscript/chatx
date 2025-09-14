import { io, Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  message: string;
  user: string;
  room: string;
  timestamp: string;
  socketId?: string;
}

export interface SocketEvents {
  receive_message: (message: Message) => void;
  user_joined: (data: { message: string; timestamp: string; type: string }) => void;
  user_left: (data: { message: string; timestamp: string; type: string }) => void;
  user_typing: (data: { user: string; isTyping: boolean; socketId: string }) => void;
  error: (error: { message: string; error?: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3001';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
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

  joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('join_room', room);
    }
  }

  sendMessage(messageData: { message: string; user: string; room: string }): void {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  sendTyping(data: { user: string; room: string; isTyping: boolean }): void {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onUserTyping(callback: (data: { user: string; isTyping: boolean; socketId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
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
