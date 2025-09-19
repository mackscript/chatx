import { useState, useEffect, useCallback, useRef } from "react";
import socketService, {
  type Message,
  type OnlineUser,
} from "../services/socketService";
import apiService from "../services/apiService";

interface UseChatProps {
  username: string;
  room: string;
}

interface TypingUser {
  user: string;
  socketId: string;
}

interface SocketError {
  message: string;
  type?: string;
  error?: string;
}

export const useChat = ({ username, room }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading messages for room:", room, "user:", username);

      const response = await apiService.getMessages({
        room,
        limit: 20,
        // Removed userId to fetch messages by room only
      });

      console.log("📥 API Response:", response);

      if (response.success) {
        console.log(
          "✅ Messages loaded successfully:",
          response.data.length,
          "messages",
        );
        // Reverse to show oldest first and ensure reactions field exists
        const reversedMessages = [...response.data].reverse().map(msg => ({
          ...msg,
          reactions: msg.reactions || {}
        }));
        console.log('📨 Messages with reactions:', reversedMessages.map(m => ({ id: m._id, reactions: m.reactions })));
        setMessages(reversedMessages);
      } else {
        console.error("❌ API returned error:", response);
        setError(
          "Failed to load messages: " + (response.message || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("❌ Failed to load messages:", err);
      setError(
        "Failed to load messages: " +
          (err instanceof Error ? err.message : "Network error"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [room, username]);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      socketService.joinRoom(room, username);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      setError("Failed to connect to server");
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
      console.log("📨 Received message:", message);
      // Ensure reactions field exists
      const messageWithReactions = {
        ...message,
        reactions: message.reactions || {}
      };
      console.log("📨 Message with reactions:", messageWithReactions.reactions);
      setMessages((prev) => [...prev, messageWithReactions]);

      // Auto-mark message as read if it's not from current user
      if (message.user !== username) {
        setTimeout(() => {
          socketService.markMessageAsRead(message._id, username);
        }, 1000); // Mark as read after 1 second
      }
    });

    socketService.onUserJoined((data) => {
      console.log("User joined:", data);
    });

    socketService.onUserLeft((data) => {
      console.log("User left:", data);
    });

    socketService.onUserTyping((data) => {
      if (data.user !== username) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.socketId !== data.socketId);
          if (data.isTyping) {
            return [...filtered, { user: data.user, socketId: data.socketId }];
          }
          return filtered;
        });

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u.socketId !== data.socketId),
            );
          }, 3000);
        }
      }
    });

    socketService.onRoomUsersUpdated(({ users }) => {
      setOnlineUsers(users);
    });

    // Listen for reaction updates
    socketService.onReactionUpdated((data) => {
      console.log('🎭 Received reaction update:', data);
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        );
        console.log('📝 Updated messages with reactions:', updatedMessages.find(m => m._id === data.messageId)?.reactions);
        return updatedMessages;
      });
    });

    // Listen for blocked reactions
    socketService.onReactionBlocked((data) => {
      console.log('🚫 Reaction blocked:', data);
      setError(`Cannot change reaction: ${data.error}`);
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    });

    socketService.onError((error: SocketError) => {
      console.error("Socket error:", error);

      // Handle specific error types
      if (error.type === "image_too_large") {
        setError(`Image upload failed: ${error.message}`);
      } else {
        setError(error.message || "Socket error occurred");
      }

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    });

    socketService.onMessageDelivered((data) => {
      setMessages((prev) =>
        prev.map((msg) =>
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
                  readBy: msg.status?.readBy || [],
                },
              }
            : msg,
        ),
      );
    });

    // Handle message read status
    socketService.onMessageRead((data) => {
      setMessages((prev) =>
        prev.map((msg) =>
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
                  readBy: [...(msg.status?.readBy || []), data.readBy],
                },
              }
            : msg,
        ),
      );
    });

    socketService.onError((error: SocketError) => {
      console.error("Socket error:", error);

      // Handle specific error types
      if (error.type === "image_too_large") {
        setError(`Image upload failed: ${error.message}`);
      } else {
        setError(error.message || "Socket error occurred");
      }

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [username]);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !isConnected) return;

      try {
        // Prepare message data
        interface MessageData {
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
        }

        const messageData: MessageData = {
          message: messageText.trim(),
          user: username,
          room,
          messageType: "text",
        };

        // Add reply information if replying to a message
        if (replyingTo) {
          console.log("🔄 Sending reply to:", replyingTo);
          messageData.replyTo = {
            messageId: replyingTo._id,
            message: replyingTo.message,
            user: replyingTo.user,
          };
          console.log("📤 Message data with reply:", messageData);
        }

        // Send via Socket.IO for real-time delivery
        socketService.sendMessage(messageData);

        // Clear reply state after sending
        setReplyingTo(null);
      } catch (err) {
        console.error("Failed to send message:", err);
        setError("Failed to send message");
      }
    },
    [username, room, isConnected, replyingTo],
  );

  const sendImageMessage = useCallback(
    async (imageData: string, caption: string = "") => {
      if (!isConnected) return;

      try {
        console.log("📤 Sending image message:", {
          captionLength: caption.length,
          imageDataSize:
            (imageData.length / (1024 * 1024)).toFixed(2) + "MB (Base64)",
          hasReply: !!replyingTo,
        });

        interface ImageMessageData {
          message: string;
          user: string;
          room: string;
          messageType: "image";
          imageData: string;
          replyTo?: {
            messageId: string;
            message: string;
            user: string;
          };
        }

        const messageData: ImageMessageData = {
          message: caption || "", // Ensure message is never undefined
          user: username,
          room,
          messageType: "image",
          imageData,
        };

        // Debug logging
        console.log("🖼️ Prepared image message data:", {
          messageLength: messageData.message.length,
          user: messageData.user,
          room: messageData.room,
          messageType: messageData.messageType,
          hasImageData: !!messageData.imageData,
          imageDataSize: (messageData.imageData.length / (1024 * 1024)).toFixed(2) + "MB"
        });

        // Add reply information if replying to a message
        if (replyingTo) {
          messageData.replyTo = {
            messageId: replyingTo._id,
            message: replyingTo.message,
            user: replyingTo.user,
          };
        }

        // Send via Socket.IO for real-time delivery
        socketService.sendMessage(messageData);

        // Clear reply state after sending
        setReplyingTo(null);

        console.log("✅ Image message sent successfully");
      } catch (err) {
        console.error("❌ Failed to send image:", err);
        setError("Failed to send image. The image might be too large.");
      }
    },
    [username, room, isConnected, replyingTo],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (isConnected) {
        socketService.sendTyping({
          user: username,
          room,
          isTyping,
        });
      }
    },
    [username, room, isConnected],
  );

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
      (msg) => msg.user !== username && !msg.status?.readBy?.includes(username),
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg) => msg._id);
      socketService.markMessagesAsReadBulk(messageIds, username);
    }
  }, [messages, username]);

  // Reply-related functions
  const startReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Reaction-related function
  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    console.log('🔄 Toggling reaction:', { messageId, emoji, username, room });
    socketService.toggleReaction(messageId, emoji, username, room);
  }, [username, room]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    typingUsers,
    onlineUsers,
    replyingTo,
    sendMessage,
    sendImageMessage,
    handleTyping,
    loadMessages,
    markMessagesAsRead,
    startReply,
    cancelReply,
    toggleReaction,
  };
};
