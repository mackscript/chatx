import { useState, useEffect, useCallback, useRef } from 'react';
import socketService, { type Message, type OnlineUser } from '../services/socketService';
import apiService from '../services/apiService';

interface UseChatProps {
  username: string;
  room: string;
}

interface TypingUser {
  user: string;
  socketId: string;
}

export const useChat = ({ username, room }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading messages for room:', room, 'username:', username);
      const response = await apiService.getMessages({ 
        room, 
        limit: 50, 
        userId: username 
      });
      if (response.success) {
        console.log('API Response:', response);
        console.log('Raw messages from API:', response.data);
        // Reverse to show oldest first
        const reversedMessages = [...response.data].reverse();
        console.log('Reversed messages:', reversedMessages);
        setMessages(reversedMessages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [room, username]);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketService.joinRoom(room, username);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setError('Failed to connect to server');
      setIsConnected(false);
    });

    // Load initial messages
    loadMessages();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [room, loadMessages, username]);

  // Set up message listeners
  useEffect(() => {
    socketService.onReceiveMessage((message: Message) => {
      console.log('Received message via socket:', message);
      console.log('Message status:', message.status);
      setMessages(prev => [...prev, message]);
      
      // Auto-mark message as read if it's not from current user
      if (message.user !== username) {
        setTimeout(() => {
          socketService.markMessageAsRead(message._id, username);
        }, 1000); // Mark as read after 1 second
      }
    });

    socketService.onUserJoined((data) => {
      console.log('User joined:', data);
    });

    socketService.onUserLeft((data) => {
      console.log('User left:', data);
    });

    socketService.onUserTyping((data) => {
      if (data.user !== username) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.socketId !== data.socketId);
          if (data.isTyping) {
            return [...filtered, { user: data.user, socketId: data.socketId }];
          }
          return filtered;
        });

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.socketId !== data.socketId));
          }, 3000);
        }
      }
    });

    socketService.onRoomUsersUpdated((data) => {
      setOnlineUsers(data.users);
    });

    // Handle message delivery status
    socketService.onMessageDelivered((data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { 
              ...msg, 
              status: { 
                sent: true,
                delivered: true,
                read: msg.status?.read || false,
                deliveredAt: data.deliveredAt,
                readAt: msg.status?.readAt || null,
                deliveredTo: data.deliveredTo,
                readBy: msg.status?.readBy || []
              }
            }
          : msg
      ));
    });

    // Handle message read status
    socketService.onMessageRead((data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { 
              ...msg, 
              status: { 
                sent: true,
                delivered: msg.status?.delivered || true,
                read: true,
                deliveredAt: msg.status?.deliveredAt || null,
                readAt: data.readAt,
                deliveredTo: msg.status?.deliveredTo || [],
                readBy: [...(msg.status?.readBy || []), data.readBy]
              }
            }
          : msg
      ));
    });

    socketService.onError((error) => {
      console.error('Socket error:', error);
      setError(error.message || 'Socket error occurred');
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [username]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !isConnected) return;

    try {
      // Send via Socket.IO for real-time delivery
      socketService.sendMessage({
        message: messageText.trim(),
        user: username,
        room
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, [username, room, isConnected]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (isConnected) {
      socketService.sendTyping({
        user: username,
        room,
        isTyping
      });
    }
  }, [username, room, isConnected]);

  const handleTyping = useCallback(() => {
    sendTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1000);
  }, [sendTyping]);

  // Mark messages as read when user focuses/opens chat
  const markMessagesAsRead = useCallback(() => {
    const unreadMessages = messages.filter(
      msg => msg.user !== username && !msg.status?.readBy?.includes(username)
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      socketService.markMessagesAsReadBulk(messageIds, username);
    }
  }, [messages, username]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    typingUsers,
    onlineUsers,
    sendMessage,
    handleTyping,
    loadMessages,
    markMessagesAsRead
  };
};
