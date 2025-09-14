import { useState } from 'react';

interface UserSetupProps {
  onUserSet: (username: string, room: string) => void;
}

const UserSetup = ({ onUserSet }: UserSetupProps) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onUserSet(username.trim(), room);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Join <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">ChatRoom</span>
            </h1>
            <p className="text-gray-400">Enter your details to start chatting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="general">General</option>
                <option value="random">Random</option>
                <option value="tech">Tech Talk</option>
                <option value="gaming">Gaming</option>
              </select>
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
  );
};

export default UserSetup;
