import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [showRoomCreated, setShowRoomCreated] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");

  const generateRoomId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
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
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-10 bg-gray-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">ChatX</h1>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-xs sm:text-sm text-gray-400 flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Messages auto-delete after 24hrs</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl w-full mx-auto text-center">
          {/* Hero Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight animate-fade-in">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-400 via-violet-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-300%">
                  ChatX
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Connect instantly with friends and colleagues in our modern,
                real-time chat experience designed for seamless communication.
              </p>

            {/* CTA Buttons */}
            <div className="pt-6 sm:pt-8">
            {!showRoomCreated ? (
              <button
                onClick={handleCreateRoom}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-sm sm:text-base rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-out active:scale-95">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
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
              <div className="space-y-6 px-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 max-w-md mx-auto animate-scale-in shadow-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    🎉 Room Created!
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Share this URL:
                      </p>
                      <p className="text-xs sm:text-sm text-blue-400 font-mono break-all">
                        {window.location.origin}/{createdRoomId}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={copyRoomUrl}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors active:scale-95">
                        Copy URL
                      </button>
                      <button
                        onClick={handleJoinRoom}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm rounded-lg hover:shadow-lg transition-all active:scale-95">
                        Join Room
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoomCreated(false)}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                  Create Another Room
                </button>
              </div>
            )}
            </div>

            {/* Features */}
            <div className="pt-12 sm:pt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
              <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all hover:shadow-lg hover:scale-105 transform duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
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
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Real-time messaging with instant delivery and seamless
                  performance.
                </p>
            </div>

              <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-violet-500/50 transition-all hover:shadow-lg hover:scale-105 transform duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400"
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
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Secure</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Your conversations are protected with modern security standards.
                </p>
            </div>

              <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-all hover:shadow-lg hover:scale-105 transform duration-300 sm:col-span-2 md:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400"
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
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  User Friendly
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
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
