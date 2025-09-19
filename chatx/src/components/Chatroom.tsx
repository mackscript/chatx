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
  const { theme } = useTheme();
  const currentTheme = themeConfig[theme] || themeConfig.dark;
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    fileName: string;
  } | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    startReply(message);
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
  // Share room functionality
  const handleShareRoom = async () => {
    const roomUrl = `${window.location.origin}/${room}`;

    try {
      if (navigator.share) {
        // Use native share API if available (mobile)
        await navigator.share({
          title: "Join my ChatX room!",
          text: "Come chat with me in this room",
          url: roomUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(roomUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (error) {
      console.error("Failed to share:", error);
      // Fallback to clipboard copy if share fails
      try {
        await navigator.clipboard.writeText(roomUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
      }
    }
  };

  // Helper function for message bubble styling
  const getMessageBubbleClass = (isOwnMessage: boolean) => {
    const baseClasses =
      "max-w-[85%] sm:max-w-[70%] md:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 backdrop-blur-sm relative";

    if (isOwnMessage) {
      return `${baseClasses} ${currentTheme.messageOwn} text-white focus:ring-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-2xl rounded-br-md ml-auto`;
    }

    return `${baseClasses} ${currentTheme.messageOther} ${currentTheme.messageOtherText} focus:ring-gray-400/20 hover:scale-[1.01] rounded-2xl rounded-bl-md mr-auto`;
  };

  return (
    <div
      className={`h-screen flex flex-col ${currentTheme.background} relative`}
    >
      {/* Header */}
      <header
        className={`${currentTheme.header} backdrop-blur-sm border-b ${currentTheme.border} p-3 sm:p-4 sticky top-0 z-40`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
            <button
              onClick={onLeave}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-105 ${currentTheme.surface} ${currentTheme.textSecondary} hover:${currentTheme.text}`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
            <div className="flex-1">
              <h1
                className={`text-lg sm:text-xl font-bold ${currentTheme.text} bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}
              >
                ChatRoom
              </h1>
              <div
                className={`hidden sm:flex items-center gap-1 text-sm ${currentTheme.textSecondary}`}
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
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></div>
                  <span className={`text-[10px] sm:text-xs ${currentTheme.textSecondary}`}>
                    {onlineUsers.length} online
                  </span>
                </div>
                {onlineUsers.length > 0 && (
                  <div className="hidden sm:flex items-center space-x-1">
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

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Share Room Button */}
            <div className="relative group">
              <button
                onClick={handleShareRoom}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg ${currentTheme.surface} ${currentTheme.textSecondary} hover:${currentTheme.text} active:scale-95`}
                title="Share Room"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Share Room
              </div>
            </div>

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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`sm:hidden p-2 rounded-lg ${currentTheme.surface} ${currentTheme.textSecondary}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`sm:hidden absolute top-[60px] left-0 right-0 z-30 ${currentTheme.surface} border-b ${currentTheme.border} shadow-lg`}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${currentTheme.textSecondary}`}>
                Connection
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
                <span className={`text-sm ${currentTheme.text}`}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleShareRoom}
              className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 ${currentTheme.surface} ${currentTheme.text} hover:bg-gray-700 transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Share Room</span>
            </button>

            <div className="pt-2 border-t ${currentTheme.border}">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${currentTheme.textSecondary}`}>Theme</span>
                <ThemeDropdown />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`${currentTheme.surface} ${currentTheme.text} px-4 py-3 rounded-xl shadow-lg border ${currentTheme.border} backdrop-blur-sm flex items-center space-x-3`}
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Room URL copied!</p>
              <p className={`text-xs ${currentTheme.textSecondary}`}>
                Share it with your friends
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
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
                className={`flex mb-3 sm:mb-4 ${
                  message.user === username
                    ? "justify-end pl-4 sm:pl-12"
                    : "justify-start pr-4 sm:pr-12"
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
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mb-1 flex-shrink-0">
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
                          className={`text-[11px] sm:text-xs mb-1 font-medium ${currentTheme.textSecondary} ml-1`}
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
                          <p className="text-xs sm:text-sm leading-relaxed">
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
                            className={`text-[10px] sm:text-xs ${
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
        className={`chat-input-area ${currentTheme.header} backdrop-blur-md border-t ${currentTheme.border} p-3 sm:p-4 md:p-6 shadow-lg`}
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
            className="flex items-center space-x-2 sm:space-x-3"
          >
            {/* Message Input Container */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  isConnected ? "Type a message..." : "Connecting..."
                }
                disabled={!isConnected}
                rows={1}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-xl sm:rounded-2xl border sm:border-2 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 resize-none overflow-hidden shadow-sm ${currentTheme.input} focus:${currentTheme.inputFocus} hover:shadow-md text-sm sm:text-base`}
                style={{
                  minHeight: "52px",
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

              {/* Character count indicator */}
              {newMessage.length > 100 && (
                <div
                  className={`absolute bottom-1 sm:bottom-2 right-2 sm:right-3 text-[10px] sm:text-xs ${currentTheme.textSecondary} opacity-60`}
                >
                  {newMessage.length}
                </div>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="flex items-center space-x-2">
              {/* Image Upload Button */}
              <div className="relative group">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  disabled={!isConnected}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Share Image
                </div>
              </div>

              {/* Send Button */}
              <div className="relative group">
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${currentTheme.accent} text-white font-medium rounded-full hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center shadow-lg relative overflow-hidden group`}
                >
                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150 rounded-full"></div>

                  {/* Send Icon */}
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-200 ${
                      !newMessage.trim()
                        ? "rotate-0"
                        : "rotate-12 group-hover:rotate-45"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {newMessage.trim() ? "Send Message" : "Type a message"}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
