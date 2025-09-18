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

  // Function to download the image
  const downloadImage = () => {
    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = imageData;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `chatx-image-${timestamp}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

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

          {/* Download Button - appears on hover */}
          {imageLoaded && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage();
                }}
                className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                title="Download image"
                aria-label="Download image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Caption */}
        {caption && <p className="text-sm mt-2 text-gray-200">{caption}</p>}
      </div>
    </>
  );
};

export default ImageMessage;
