import { Play, Pause } from 'lucide-react';

/**
 * Video player component with YouTube iframe and controls
 * Single Responsibility: Display video and control buttons
 */
export default function VideoPlayer({ onPlayPause, isPlaying }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div id="youtube-player" className="w-full aspect-video mb-4 bg-gray-900 rounded"></div>
      
      <div className="flex gap-2">
        {/* ✅ Single button that toggles between Play/Pause */}
        <button
          onClick={onPlayPause}
          className={`flex items-center gap-2 px-6 py-2 text-white rounded transition ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={18} />
              Pause
            </>
          ) : (
            <>
              <Play size={18} />
              Play
            </>
          )}
        </button>
      </div>
    </div>
  );
}
