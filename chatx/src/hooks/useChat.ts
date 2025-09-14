import { useState, useEffect, useCallback, useRef } from 'react';
import socketService, { type Message } from '../services/socketService';
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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMessages({ room, limit: 50 });
      if (response.success) {
        // Reverse to show oldest first
        setMessages(response.data.reverse());
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [room]);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketService.joinRoom(room);
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
  }, [room, loadMessages]);

  // Set up message listeners
  useEffect(() => {
    socketService.onReceiveMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
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

  return {
    messages,
    isConnected,
    isLoading,
    error,
    typingUsers,
    sendMessage,
    handleTyping,
    loadMessages
  };
};
