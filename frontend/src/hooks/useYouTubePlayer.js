import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing YouTube IFrame Player
 * Handles player initialization, state changes, and actions
 */
export const useYouTubePlayer = (videoUrl, onStateChange, onSeek) => {
  const playerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const lastTimeRef = useRef(0);

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
          onReady: (event) => {
            console.log('Player ready');
            // Start tracking seeks
            if (onSeek) {
              startSeekTracking();
            }
          },
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

    // ✅ NEW: Track seeking behavior
    const startSeekTracking = () => {
      const checkSeek = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime && !isInitializingRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const timeDiff = Math.abs(currentTime - lastTimeRef.current);
          
          // If time jumped more than 1 second, it's a seek
          if (timeDiff > 1) {
            if (onSeek) {
              onSeek(currentTime);
            }
          }
          
          lastTimeRef.current = currentTime;
        }
      }, 500); // Check every 500ms

      // Store interval ID to clear on cleanup
      playerRef.current._seekInterval = checkSeek;
    };

    if (window.YT.loaded) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        if (playerRef.current._seekInterval) {
          clearInterval(playerRef.current._seekInterval);
        }
        playerRef.current.destroy();
      }
    };
  }, [videoUrl, onStateChange, onSeek]);

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

  // ✅ NEW: Seek to specific timestamp
  const seekTo = useCallback((timestamp) => {
    if (playerRef.current && playerRef.current.seekTo) {
      isInitializingRef.current = true;
      playerRef.current.seekTo(timestamp, true);
      lastTimeRef.current = timestamp;
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 500);
    }
  }, []);

  const setInitializing = useCallback((value) => {
    isInitializingRef.current = value;
  }, []);

  return {
    play,
    pause,
    seekTo,  // ✅ NEW
    setInitializing,
    playerRef,  // ✅ Expose ref for getCurrentTime access
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
