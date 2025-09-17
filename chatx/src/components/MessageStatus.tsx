import React from "react";
import type { MessageStatus as MessageStatusType } from "../services/socketService";

interface MessageStatusProps {
  status?: MessageStatusType;
  isOwnMessage: boolean;
  className?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  isOwnMessage,
  className = "",
}) => {
  // Only show status for own messages
  if (!isOwnMessage || !status) {
    return null;
  }

  // Determine which status to show
  const getStatusIcon = () => {
    if (status.read) {
      // Blue double tick - message has been read
      return (
        <div className="flex items-center space-x-0.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="text-blue-500"
            fill="currentColor"
          >
            {/* First tick */}
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            {/* Second tick (offset) */}
            <path d="M15.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .708-.708l.646.647 6.646-6.647a.5.5 0 0 1 .708 0z" />
          </svg>
        </div>
      );
    } else if (status.delivered) {
      // Gray double tick - message has been delivered but not read
      return (
        <div className="flex items-center space-x-0.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="text-gray-400"
            fill="currentColor"
          >
            {/* First tick */}
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            {/* Second tick (offset) */}
            <path d="M15.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .708-.708l.646.647 6.646-6.647a.5.5 0 0 1 .708 0z" />
          </svg>
        </div>
      );
    } else if (status.sent) {
      // Single gray tick - message has been sent but not delivered
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="text-gray-400"
          fill="currentColor"
        >
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
        </svg>
      );
    }

    // No status or pending
    return (
      <div className="w-4 h-4 rounded-full border-2 border-gray-400 animate-spin border-t-transparent" />
    );
  };

  return (
    <div className={`flex items-center justify-end ${className}`}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;
