import React, { useState } from 'react';

interface ImagePreviewProps {
  imageData: string;
  fileName: string;
  onSend: () => void;
  onCancel: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageData, 
  fileName, 
  onSend, 
  onCancel 
}) => {
  const [caption, setCaption] = useState('');

  const handleSend = () => {
    onSend();
  };

  return (
    <div className="bg-gray-800/90 border border-gray-700 rounded-lg p-4 mx-4 mb-2">
      <div className="flex items-start space-x-3">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          <img
            src={imageData}
            alt={fileName}
            className="w-20 h-20 object-cover rounded-lg border border-gray-600"
          />
        </div>
        
        {/* Image Info and Caption */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-300 truncate" title={fileName}>
              {fileName}
            </p>
            <button
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Caption Input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="flex-1 bg-gray-700 text-white text-sm px-3 py-1 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="px-4 py-1 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all duration-200 font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
