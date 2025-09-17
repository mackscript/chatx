import React, { useState } from 'react';

interface ImageMessageProps {
  imageData: string;
  caption?: string;
  className?: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ 
  imageData, 
  caption, 
  className = '' 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <div className={`${className}`}>
        {/* Image Container */}
        <div 
          className="relative cursor-pointer group"
          onClick={openFullscreen}
        >
          {!imageLoaded && (
            <div className="w-48 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <img
            src={imageData}
            alt="Shared image"
            className={`max-w-48 max-h-64 rounded-lg object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
        
        {/* Caption */}
        {caption && (
          <p className="text-sm mt-2 text-gray-200">
            {caption}
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={imageData}
              alt="Shared image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Caption in fullscreen */}
            {caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3">
                <p className="text-white text-center">
                  {caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageMessage;
