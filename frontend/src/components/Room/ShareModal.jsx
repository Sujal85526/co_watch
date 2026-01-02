import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Modal for sharing room code
 * Single Responsibility: Display and copy room code
 */
export default function ShareModal({ roomCode, onClose }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Room</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Share this code with others to invite them to the room:
        </p>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={roomCode}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-lg"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <Copy size={18} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
