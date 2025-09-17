import React from 'react';
import type { Message } from '../services/socketService';

interface ReplyPreviewProps {
  replyingTo: Message;
  onCancel: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyingTo, onCancel }) => {
  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <div className="bg-gray-800/50 border-l-4 border-blue-500 p-3 mx-4 mb-2 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <svg 
              className="w-4 h-4 text-blue-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" 
              />
            </svg>
            <span className="text-xs text-blue-400 font-medium">
              Replying to {replyingTo.user}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {truncateMessage(replyingTo.message)}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="ml-2 p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg 
            className="w-4 h-4 text-gray-400 hover:text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReplyPreview;
