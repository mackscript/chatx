import React, { useState } from "react";

interface ImageMessageProps {
  imageData: string;
  caption?: string;
  className?: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({
  imageData,
  caption,
  className = "",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <div className={`${className}`}>
        {/* Image Container */}
        <div className="relative cursor-pointer group">
          {!imageLoaded && (
            <div className="w-48 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <img
            src={imageData}
            alt="Shared image"
            className={` w-45 h-80  rounded-lg object-cover transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0 absolute"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>

        {/* Caption */}
        {caption && <p className="text-sm mt-2 text-gray-200">{caption}</p>}
      </div>
    </>
  );
};

export default ImageMessage;
