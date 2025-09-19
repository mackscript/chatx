import React, { useState, useEffect, useRef } from "react";
import type { MessageReactions } from "../services/socketService";
import { useTheme, themeConfig } from "../contexts/ThemeContext";

interface MessageReactionsProps {
  reactions: MessageReactions | undefined;
  currentUser: string;
  onToggleReaction: (emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

const MessageReactionsComponent: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUser,
  onToggleReaction,
}) => {
  const { theme } = useTheme();
  const currentTheme = themeConfig[theme] || themeConfig.dark;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleReactionClick = (emoji: string) => {
    console.log("🎯 Reaction clicked:", emoji, "by user:", currentUser);
    onToggleReaction(emoji);
    setShowEmojiPicker(false);
  };

  const hasUserReacted = (emoji: string): boolean => {
    if (!reactions || typeof reactions !== "object") return false;
    return reactions[emoji]?.includes(currentUser) || false;
  };

  // Get the user's current reaction (if any) - for visual feedback
  const getUserCurrentReaction = (): string | null => {
    if (!reactions || typeof reactions !== "object") return null;
    for (const [emoji, users] of Object.entries(reactions)) {
      if (users.includes(currentUser)) {
        return emoji;
      }
    }
    return null;
  };

  // Ensure reactions is always an object
  const safeReactions = reactions || {};
  const userCurrentReaction = getUserCurrentReaction();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Debug log to see what reactions we're getting
  console.log("🎭 MessageReactions render:", {
    reactions,
    safeReactions,
    currentUser,
    userCurrentReaction,
    hasReactions: Object.keys(safeReactions).length > 0,
  });

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Display existing reactions */}
      {Object.keys(safeReactions).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(safeReactions).map(([emoji, users]) => {
            console.log(
              "🎯 Rendering reaction:",
              emoji,
              "users:",
              users,
              "hasUserReacted:",
              hasUserReacted(emoji),
            );
            return (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all transform hover:scale-110 ${
                  hasUserReacted(emoji)
                    ? `bg-blue-600 text-white`
                    : `${currentTheme.surface} ${currentTheme.textSecondary} hover:bg-gray-700`
                }`}
                title={users.join(", ")}
              >
                <span className="text-sm">{emoji}</span>
                <span className="font-medium">{users.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add reaction button - Always visible like Facebook Messenger */}
      <div className="relative inline-block" ref={pickerRef}>
        {!userCurrentReaction ? (
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 rounded-full transition-all hover:scale-110 ${currentTheme.surface} ${currentTheme.textSecondary} hover:${currentTheme.text} border ${currentTheme.border} opacity-70 hover:opacity-100`}
            title="Add reaction"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        ) : null}

        {/* Emoji picker dropdown */}
        {showEmojiPicker && (
          <div
            className={`absolute bottom-full mb-2 left-0 z-50 ${currentTheme.surface} rounded-lg shadow-2xl border ${currentTheme.border} p-2 backdrop-blur-sm`}
          >
            <div className="flex gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  disabled={!!(userCurrentReaction && !hasUserReacted(emoji))}
                  className={`p-2 rounded-lg transition-all transform hover:scale-125 active:scale-110 ${
                    hasUserReacted(emoji)
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : userCurrentReaction && !hasUserReacted(emoji)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-700"
                  }`}
                  title={
                    hasUserReacted(emoji)
                      ? `Remove ${emoji} reaction`
                      : userCurrentReaction && !hasUserReacted(emoji)
                      ? `You already reacted with ${userCurrentReaction}`
                      : `React with ${emoji}`
                  }
                >
                  <span className="text-lg">{emoji}</span>
                </button>
              ))}
            </div>
            {/* Arrow pointing down */}
            <div
              className={`absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700`}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactionsComponent;
