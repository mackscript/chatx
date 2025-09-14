import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserSetup from "./UserSetup";
import Chatroom from "./Chatroom";

interface UserData {
  username: string;
  room: string;
}

const STORAGE_KEY = 'chatx-user-session';

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate room ID
  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Check for saved session for this room
    try {
      const savedSession = localStorage.getItem(`${STORAGE_KEY}-${roomId}`);
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession.username && parsedSession.room === roomId) {
          setUserData(parsedSession);
        } else {
          setShowUserSetup(true);
        }
      } else {
        setShowUserSetup(true);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem(`${STORAGE_KEY}-${roomId}`);
      setShowUserSetup(true);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigate]);

  const handleUserSet = (username: string) => {
    if (!roomId) return;
    
    const newUserData = { username, room: roomId };
    setUserData(newUserData);
    setShowUserSetup(false);
    
    // Save to localStorage with room-specific key
    try {
      localStorage.setItem(`${STORAGE_KEY}-${roomId}`, JSON.stringify(newUserData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleLeaveChat = () => {
    if (!roomId) return;
    
    setUserData(null);
    setShowUserSetup(false);
    
    // Clear localStorage for this room
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${roomId}`);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
    
    // Navigate back to home
    navigate('/');
  };

  // Show loading spinner while checking for saved session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (userData && roomId) {
    return (
      <Chatroom 
        username={userData.username} 
        room={roomId} 
        onLeave={handleLeaveChat} 
      />
    );
  }

  if (showUserSetup && roomId) {
    return (
      <UserSetup 
        onUserSet={handleUserSet} 
        roomId={roomId}
        isJoining={true}
      />
    );
  }

  return null;
};

export default RoomPage;
