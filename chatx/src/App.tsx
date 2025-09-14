import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import UserSetup from "./components/UserSetup";
import Chatroom from "./components/Chatroom";
import "./App.css";

interface UserData {
  username: string;
  room: string;
}

const STORAGE_KEY = 'chatx-user-session';

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession.username && parsedSession.room) {
          setUserData(parsedSession);
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUserSet = (username: string, room: string) => {
    const newUserData = { username, room };
    setUserData(newUserData);
    setShowUserSetup(false);
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUserData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleLeaveChat = () => {
    setUserData(null);
    setShowUserSetup(false);
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const handleJoinChat = () => {
    setShowUserSetup(true);
  };

  // Show loading spinner while checking for saved session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (userData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Chatroom 
          username={userData.username} 
          room={userData.room} 
          onLeave={handleLeaveChat} 
        />
      </div>
    );
  }

  if (showUserSetup) {
    return (
      <div className="min-h-screen bg-gray-900">
        <UserSetup onUserSet={handleUserSet} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Home onJoinChat={handleJoinChat} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
