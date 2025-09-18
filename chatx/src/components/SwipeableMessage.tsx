import { useState, useRef, useEffect, type ReactNode } from 'react';

interface SwipeableMessageProps {
  children: ReactNode;
  onSwipeReply: () => void;
  isOwnMessage: boolean;
  className?: string;
}

const SwipeableMessage = ({ 
  children, 
  onSwipeReply, 
  isOwnMessage, 
  className = '' 
}: SwipeableMessageProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [showReplyIcon, setShowReplyIcon] = useState(false);
  
  const messageRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  // Swipe threshold (in pixels)
  const SWIPE_THRESHOLD = 80;
  const REPLY_TRIGGER_THRESHOLD = 60;
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsDragging(true);
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    setCurrentX(touch.clientX);
    
    const deltaX = touch.clientX - startX;
    
    // Only allow swipe in the correct direction
    // For own messages: swipe left (negative deltaX)
    // For other messages: swipe right (positive deltaX)
    const allowedDirection = isOwnMessage ? deltaX < 0 : deltaX > 0;
    
    if (allowedDirection) {
      const clampedDelta = Math.min(Math.abs(deltaX), SWIPE_THRESHOLD);
      const finalDelta = isOwnMessage ? -clampedDelta : clampedDelta;
      
      setTranslateX(finalDelta);
      setShowReplyIcon(Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD);
      
      // Add haptic feedback when threshold is reached
      if (Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD && 'vibrate' in navigator) {
        navigator.vibrate([10]);
      }
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const shouldTriggerReply = Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD;
    
    setIsDragging(false);
    
    if (shouldTriggerReply) {
      // Trigger reply action
      onSwipeReply();
      
      // Add stronger haptic feedback for successful action
      if ('vibrate' in navigator) {
        navigator.vibrate([50]);
      }
    }
    
    // Animate back to original position
    animateToPosition(0);
    setShowReplyIcon(false);
  };
  
  // Handle mouse events for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setCurrentX(e.clientX);
    
    const deltaX = e.clientX - startX;
    const allowedDirection = isOwnMessage ? deltaX < 0 : deltaX > 0;
    
    if (allowedDirection) {
      const clampedDelta = Math.min(Math.abs(deltaX), SWIPE_THRESHOLD);
      const finalDelta = isOwnMessage ? -clampedDelta : clampedDelta;
      
      setTranslateX(finalDelta);
      setShowReplyIcon(Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD);
    }
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const shouldTriggerReply = Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD;
    
    setIsDragging(false);
    
    if (shouldTriggerReply) {
      onSwipeReply();
    }
    
    animateToPosition(0);
    setShowReplyIcon(false);
  };
  
  // Animate to target position
  const animateToPosition = (targetX: number) => {
    const animate = () => {
      setTranslateX(prev => {
        const diff = targetX - prev;
        const step = diff * 0.2;
        
        if (Math.abs(diff) < 0.5) {
          return targetX;
        }
        
        animationRef.current = requestAnimationFrame(animate);
        return prev + step;
      });
    };
    
    animate();
  };
  
  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setCurrentX(e.clientX);
        
        const deltaX = e.clientX - startX;
        const allowedDirection = isOwnMessage ? deltaX < 0 : deltaX > 0;
        
        if (allowedDirection) {
          const clampedDelta = Math.min(Math.abs(deltaX), SWIPE_THRESHOLD);
          const finalDelta = isOwnMessage ? -clampedDelta : clampedDelta;
          
          setTranslateX(finalDelta);
          setShowReplyIcon(Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD);
        }
      };
      
      const handleGlobalMouseUp = () => {
        const deltaX = currentX - startX;
        const shouldTriggerReply = Math.abs(deltaX) > REPLY_TRIGGER_THRESHOLD;
        
        setIsDragging(false);
        
        if (shouldTriggerReply) {
          onSwipeReply();
        }
        
        animateToPosition(0);
        setShowReplyIcon(false);
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX, currentX, isOwnMessage, onSwipeReply]);
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className={`relative ${className}`}>
      {/* Reply Icon Background */}
      {showReplyIcon && (
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 z-0 transition-opacity duration-200 ${
            isOwnMessage ? 'right-4' : 'left-4'
          }`}
          style={{
            opacity: Math.min(Math.abs(translateX) / REPLY_TRIGGER_THRESHOLD, 1)
          }}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
          </div>
        </div>
      )}
      
      {/* Message Content */}
      <div
        ref={messageRef}
        className={`relative z-10 transition-transform ${isDragging ? '' : 'duration-300 ease-out'}`}
        style={{
          transform: `translateX(${translateX}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        role="button"
        tabIndex={0}
        aria-label={`Swipe ${isOwnMessage ? 'left' : 'right'} to reply to this message`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSwipeReply();
          }
        }}
      >
        {children}
      </div>
      
      {/* Swipe Hint */}
      {!isDragging && (
        <div className={`absolute top-1/2 transform -translate-y-1/2 text-xs text-gray-500 opacity-0 hover:opacity-100 transition-opacity duration-300 ${
          isOwnMessage ? 'left-2' : 'right-2'
        }`}>
          {isOwnMessage ? '← Swipe to reply' : 'Swipe to reply →'}
        </div>
      )}
    </div>
  );
};

export default SwipeableMessage;
