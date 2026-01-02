import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomByCode } from '../../api/roomsApi'; // Create this API next
import toast from 'react-hot-toast';

export default function JoinRoomPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Enter room code');
    setLoading(true);
    try {
      const room = await getRoomByCode(code.trim());
      navigate(`/rooms/${room.id}`);
      toast.success(`Joined ${room.name}!`);
    } catch (err) {
      toast.error('Room not found');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Join Room</h1>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Paste room code (ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9]/gi, ''))}
            maxLength={6}
            className="w-full p-4 bg-white/50 rounded-xl text-lg font-mono tracking-wider text-center uppercase border-2 border-white/30 focus:border-white focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-4 bg-white text-purple-600 font-bold text-lg rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        <p className="text-white/80 text-sm mt-4 text-center">
          Ask room owner for code or <a href="/rooms" className="underline hover:text-white">create your own</a>
        </p>
      </div>
    </div>
  );
}
