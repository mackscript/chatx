import React from 'react';
import type { ReplyTo } from '../services/socketService';

interface ReplyDisplayProps {
  replyTo: ReplyTo;
  className?: string;
}

const ReplyDisplay: React.FC<ReplyDisplayProps> = ({ replyTo, className = '' }) => {
  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <div className={`bg-gray-700/50 border-l-2 border-gray-500 pl-2 py-1 mb-2 rounded-r ${className}`}>
      <div className="flex items-center space-x-1 mb-1">
        <svg 
          className="w-3 h-3 text-gray-400" 
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
        <span className="text-xs text-gray-400 font-medium">
          {replyTo.user}
        </span>
      </div>
      <p className="text-xs text-gray-300">
        {truncateMessage(replyTo.message)}
      </p>
    </div>
  );
};

export default ReplyDisplay;
