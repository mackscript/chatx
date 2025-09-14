import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [showRoomCreated, setShowRoomCreated] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    setCreatedRoomId(roomId);
    setShowRoomCreated(true);
  };

  const handleJoinRoom = () => {
    navigate(`/${createdRoomId}`);
  };

  const copyRoomUrl = () => {
    const url = `${window.location.origin}/${createdRoomId}`;
    navigator.clipboard.writeText(url);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl mt-14  md:text-6xl font-bold text-white tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                ChatRoom
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Connect instantly with friends and colleagues in our modern,
              real-time chat experience designed for seamless communication.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-8">
            {!showRoomCreated ? (
              <button
                onClick={handleCreateRoom}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create a New Chat
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-4">Room Created!</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Share this URL:</p>
                      <p className="text-sm text-blue-400 font-mono break-all">
                        {window.location.origin}/{createdRoomId}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={copyRoomUrl}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={handleJoinRoom}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoomCreated(false)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Create Another Room
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-400 text-sm">
                Real-time messaging with instant delivery and seamless
                performance.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
              <p className="text-gray-400 text-sm">
                Your conversations are protected with modern security standards.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                User Friendly
              </h3>
              <p className="text-gray-400 text-sm">
                Clean, intuitive interface designed for the best user
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
