import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing YouTube IFrame Player
 * Handles player initialization, state changes, and actions
 */
export const useYouTubePlayer = (videoUrl, onStateChange) => {
  const playerRef = useRef(null);
  const isInitializingRef = useRef(false);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize player when video URL changes
  useEffect(() => {
    if (!videoUrl || !window.YT) return;

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        events: {
          onReady: (event) => console.log('Player ready'),
          onStateChange: (event) => handleStateChange(event),
        },
      });
    };

    const handleStateChange = (event) => {
      if (isInitializingRef.current) return;

      let action = null;
      if (event.data === window.YT.PlayerState.PLAYING) {
        action = 'play';
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        action = 'pause';
      }

      if (action && onStateChange) {
        onStateChange(action);
      }
    };

    if (window.YT.loaded) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoUrl, onStateChange]);

  const play = useCallback(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const setInitializing = useCallback((value) => {
    isInitializingRef.current = value;
  }, []);

  return {
    play,
    pause,
    setInitializing,
  };
};

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
