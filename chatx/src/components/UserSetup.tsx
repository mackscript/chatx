import { useState } from 'react';
import Footer from './Footer';

interface UserSetupProps {
  onUserSet: (username: string, room?: string) => void;
  roomId?: string;
  isJoining?: boolean;
}

const UserSetup = ({ onUserSet, roomId, isJoining = false }: UserSetupProps) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      if (roomId) {
        onUserSet(username.trim());
      } else {
        onUserSet(username.trim(), 'general');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isJoining ? 'Join' : 'Enter'} <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">ChatRoom</span>
              </h1>
              <p className="text-gray-400">
                {isJoining && roomId 
                  ? `Joining room: ${roomId}` 
                  : 'Enter your details to start chatting'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  maxLength={50}
                />
              </div>

              <button
                type="submit"
                disabled={!username.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Join Chat
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserSetup;
