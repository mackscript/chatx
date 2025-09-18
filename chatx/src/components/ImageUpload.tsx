import React, { useRef, useState } from 'react';
import { useTheme, themeConfig } from '../contexts/ThemeContext';

interface ImageUploadProps {
  onImageSelect: (imageData: string, fileName: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themeConfig[theme] || themeConfig.dark;

  const compressImage = (imageData: string, fileName: string, callback: (compressedData: string, compressedName: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ Canvas context not available');
        callback(imageData, fileName); // Return original if compression fails
        return;
      }

      // Calculate new dimensions - more aggressive sizing for better compression
      // Max 800px for better compression while maintaining quality
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress with better quality settings
      ctx.drawImage(img, 0, 0, width, height);
      
      // More aggressive compression - target under 1MB Base64 for better socket performance
      let quality = 0.7; // Start with lower quality
      let compressedData = canvas.toDataURL('image/jpeg', quality);
      
      // Target 1MB Base64 instead of 2MB for better socket stability
      const targetSize = 1 * 1024 * 1024; // 1MB
      
      while (compressedData.length > targetSize && quality > 0.1) {
        quality -= 0.05; // Smaller steps for better control
        compressedData = canvas.toDataURL('image/jpeg', quality);
      }

      // If still too large, try reducing dimensions further
      if (compressedData.length > targetSize && quality <= 0.1) {
        const newWidth = Math.floor(width * 0.8); // Reduce by 20%
        const newHeight = Math.floor(height * 0.8);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        compressedData = canvas.toDataURL('image/jpeg', 0.6);
      }

      console.log('✅ Image compressed:', {
        originalSize: (imageData.length / (1024 * 1024)).toFixed(2) + 'MB',
        compressedSize: (compressedData.length / (1024 * 1024)).toFixed(2) + 'MB',
        quality: quality.toFixed(2),
        dimensions: `${canvas.width}x${canvas.height}`,
        compressionRatio: ((1 - compressedData.length / imageData.length) * 100).toFixed(1) + '%'
      });

      callback(compressedData, fileName.replace(/\.[^/.]+$/, '_compressed.jpg'));
    };

    img.onerror = () => {
      console.error('❌ Image compression failed');
      callback(imageData, fileName); // Return original if compression fails
    };

    img.src = imageData;
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    // Check if file is an image with more specific validation
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!file.type || !validImageTypes.includes(file.type.toLowerCase())) {
      alert(`Unsupported file type: ${file.type}. Please select a JPEG, PNG, GIF, WebP, or BMP image.`);
      return;
    }

    // Check file size (limit to 10MB for better support)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`Image size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please select an image smaller than 10MB.`);
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imageData = e.target?.result as string;
        console.log('✅ Image loaded successfully:', {
          dataLength: imageData.length,
          dataSize: (imageData.length / (1024 * 1024)).toFixed(2) + 'MB (Base64)'
        });
        
        // Always compress images for better socket performance and smaller file sizes
        console.log('🔄 Compressing image for optimal upload...');
        compressImage(imageData, file.name, (compressedData, compressedName) => {
          onImageSelect(compressedData, compressedName);
          setIsUploading(false);
        });
        
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('❌ Error processing image:', error);
        alert('Error processing image. Please try a different image.');
        setIsUploading(false);
      }
    };

    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      alert('Error reading file. Please try again.');
      setIsUploading(false);
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        console.log(`📊 Loading progress: ${progress.toFixed(1)}%`);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleFileSelect}
        disabled={disabled || isUploading}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group ${
          disabled || isUploading
            ? `opacity-40 cursor-not-allowed ${currentTheme.surface}`
            : `${currentTheme.surface} hover:scale-105 active:scale-95 ${currentTheme.textSecondary} hover:${currentTheme.text}`
        }`}
        title="Share an image"
      >
        {/* Ripple effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-full"></div>
        
        {isUploading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ImageUpload;
