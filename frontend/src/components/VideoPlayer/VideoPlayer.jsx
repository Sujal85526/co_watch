import { Play, Pause, Loader2 } from 'lucide-react';

/**
 * Video player component with YouTube iframe and controls
 */
export default function VideoPlayer({ onPlayPause, isPlaying, isLoading }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative w-full aspect-video mb-4 bg-gray-900 rounded">
        {/* ✅ Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded z-10">
            <div className="text-center">
              <Loader2 className="animate-spin text-white mx-auto mb-2" size={32} />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}
        <div id="youtube-player" className="w-full h-full"></div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onPlayPause}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-2 text-white rounded transition ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
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
