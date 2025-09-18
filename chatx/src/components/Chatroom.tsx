import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { type Message } from "../services/socketService";
import { useTheme, themeConfig } from "../contexts/ThemeContext";
import MessageStatus from "./MessageStatus";
import ReplyPreview from "./ReplyPreview";
import ReplyDisplay from "./ReplyDisplay";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import ImageMessage from "./ImageMessage";
import ThemeDropdown from "./ThemeDropdown";
import SwipeableMessage from "./SwipeableMessage";

interface ChatroomProps {
  username: string;
  room: string;
  onLeave: () => void;
}

const Chatroom = ({ username, room, onLeave }: ChatroomProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    fileName: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const {
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
    markMessagesAsRead,
    startReply,
    cancelReply,
  } = useChat({ username, room });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when component is focused or messages change
  useEffect(() => {
    const handleFocus = () => {
      markMessagesAsRead();
    };

    // Mark messages as read when component mounts or messages change
    markMessagesAsRead();

    // Listen for window focus events
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [markMessagesAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleMessageClick = (message: Message) => {
    // startReply(message);
  };

  const handleMessageKeyDown = (e: React.KeyboardEvent, message: Message) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startReply(message);
    }
  };

  const handleImageSelect = (imageData: string, fileName: string) => {
    setSelectedImage({ data: imageData, fileName });
  };

  const handleImageSend = () => {
    if (selectedImage) {
      sendImageMessage(selectedImage.data, newMessage);
      setSelectedImage(null);
      setNewMessage("");
    }
  };

  const handleImageCancel = () => {
    setSelectedImage(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // Get current theme configuration
  const currentTheme = themeConfig[theme] || themeConfig.dark;

  // Helper function for message bubble styling
  const getMessageBubbleClass = (isOwnMessage: boolean) => {
    const baseClasses =
      "max-w-xs lg:max-w-md px-4 py-3 cursor-pointer hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 backdrop-blur-sm relative";

    if (isOwnMessage) {
      return `${baseClasses} ${currentTheme.messageOwn} text-white focus:ring-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-2xl rounded-br-md ml-auto`;
    }

    return `${baseClasses} ${currentTheme.messageOther} ${currentTheme.messageOtherText} focus:ring-gray-400/20 hover:scale-[1.01] rounded-2xl rounded-bl-md mr-auto`;
  };

  return (
    <div
      className={`h-[95vh] flex flex-col ${currentTheme.background} relative`}
    >
      {/* Header */}
      <header
        className={`${currentTheme.header} backdrop-blur-sm border-b ${currentTheme.border} p-4`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLeave}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${currentTheme.surface} ${currentTheme.textSecondary} hover:${currentTheme.text}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1
                className={`text-xl font-bold ${currentTheme.text} bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
              >
                ChatRoom
              </h1>
              <div
                className={`flex items-center gap-1 text-sm ${currentTheme.textSecondary}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  fill="currentColor"
                  className="bi bi-clock-history"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                  <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                  <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
                </svg>
                <span className="text-xs">24hrs</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className={`text-xs ${currentTheme.textSecondary}`}>
                    {onlineUsers.length} online
                  </span>
                </div>
                {onlineUsers.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs ${currentTheme.textSecondary}`}>
                      •
                    </span>
                    <div className="flex -space-x-1 ">
                      <div className="w-full capitalize text-xs text-white font-medium">
                        {onlineUsers
                          .slice(0, 3)
                          .map((user) =>
                            user.username.length > 6
                              ? user.username.substring(0, 6) + "..."
                              : user.username,
                          )
                          .join(", ")}
                      </div>
                      {onlineUsers.length > 3 && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 ${currentTheme.surface} ${currentTheme.textSecondary} ${currentTheme.border}`}
                        >
                          +{onlineUsers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <span className={`text-sm ${currentTheme.textSecondary}`}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Theme Dropdown */}
            <ThemeDropdown />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading messages...
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex mb-4 ${
                  message.user === username
                    ? "justify-end pl-12"
                    : "justify-start pr-12"
                }`}
              >
                <div
                  className={`flex items-end space-x-2 ${
                    message.user === username
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar for other users */}
                  {message.user !== username && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mb-1 flex-shrink-0">
                      {message.user.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <SwipeableMessage
                    onSwipeReply={() => startReply(message)}
                    isOwnMessage={message.user === username}
                  >
                    <div className="flex flex-col">
                      {/* Username for other users */}
                      {message.user !== username && (
                        <p
                          className={`text-xs mb-1 font-medium ${currentTheme.textSecondary} ml-1`}
                        >
                          {message.user}
                        </p>
                      )}

                      <div
                        className={getMessageBubbleClass(
                          message.user === username,
                        )}
                        onClick={() => handleMessageClick(message)}
                        onKeyDown={(e) => handleMessageKeyDown(e, message)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Reply to message from ${message.user}: ${message.message}`}
                        title="Click or swipe to reply to this message"
                      >
                        {/* Show reply information if this message is a reply */}
                        {message.replyTo && (
                          <ReplyDisplay
                            replyTo={message.replyTo}
                            className="mb-2"
                          />
                        )}

                        {/* Display message content based on type */}
                        {message.messageType === "image" ? (
                          <ImageMessage
                            imageData={message.imageData || ""}
                            caption={message.message}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">
                            {message.message}
                          </p>
                        )}

                        <div
                          className={`flex items-center mt-2 ${
                            message.user === username
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              message.user === username
                                ? "text-white/70"
                                : currentTheme.textSecondary
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>

                          {message.user === username && (
                            <MessageStatus
                              status={message.status}
                              isOwnMessage={true}
                              className="ml-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </SwipeableMessage>

                  {/* Your avatar (optional, can be removed if you don't want it) */}
                  {message.user === username && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mb-1 flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div
                className={`px-4 py-2 rounded-xl text-sm ${currentTheme.surface} ${currentTheme.textSecondary} ${currentTheme.border} border backdrop-blur-sm`}
              >
                {typingUsers.map((u) => u.user).join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div
        className={`chat-input-area ${currentTheme.header} backdrop-blur-sm border-t ${currentTheme.border} p-4`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Reply Preview */}
          {replyingTo && (
            <ReplyPreview replyingTo={replyingTo} onCancel={cancelReply} />
          )}

          {/* Image Preview */}
          {selectedImage && (
            <ImagePreview
              imageData={selectedImage.data}
              fileName={selectedImage.fileName}
              onSend={handleImageSend}
              onCancel={handleImageCancel}
            />
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-4"
          >
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                placeholder={
                  isConnected ? "Type your message..." : "Connecting..."
                }
                disabled={!isConnected}
                rows={1}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 resize-none overflow-hidden ${currentTheme.input} focus:${currentTheme.inputFocus}`}
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                  height: "auto",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <ImageUpload
              onImageSelect={handleImageSelect}
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${currentTheme.accent} text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-lg`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
