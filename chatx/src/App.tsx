import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import UserSetup from "./components/UserSetup";
import Chatroom from "./components/Chatroom";
import "./App.css";

interface UserData {
  username: string;
  room: string;
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);

  const handleUserSet = (username: string, room: string) => {
    setUserData({ username, room });
    setShowUserSetup(false);
  };

  const handleLeaveChat = () => {
    setUserData(null);
    setShowUserSetup(false);
  };

  const handleJoinChat = () => {
    setShowUserSetup(true);
  };

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
