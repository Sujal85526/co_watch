import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Form for setting YouTube video URL
 * Single Responsibility: Handle video URL input
 */
export default function VideoUrlForm({ onSubmit, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(url);
      toast.success('Video URL updated successfully');
    } catch (error) {
      toast.error('Failed to update video URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        YouTube Video URL
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Saving...' : 'Set Video'}
        </button>
      </div>
    </form>
  );
}
