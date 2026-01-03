import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, MessageSquare, X, Wifi, WifiOff } from 'lucide-react';
import * as roomsApi from '../../api/roomsApi';
import { useAuth } from '../../hooks/useAuth';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { useWebSocket } from '../../hooks/useWebSocket';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import VideoUrlForm from '../../components/VideoPlayer/VideoUrlForm';
import ChatPanel from '../../components/Chat/ChatPanel';
import ShareModal from '../../components/Room/ShareModal';
import toast from 'react-hot-toast';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);  // ✅ NEW
  const [roomError, setRoomError] = useState(null);  // ✅ NEW
  
  const playerRef = useRef(null);

  // Fetch room data with error handling
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setRoomError(null);  // ✅ Clear previous errors
        const data = await roomsApi.getRoom(id);
        setRoom(data);
        if (data.youtube_url) {
          setIsLoadingVideo(true);  // ✅ Show loading when video exists
        }
      } catch (error) {
        console.error('Failed to load room:', error);
        setRoomError('Failed to load room. Please try again.');
        toast.error('Failed to load room');
        setTimeout(() => navigate('/rooms'), 2000);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  // WebSocket message handler
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, { 
          text: data.message, 
          username: data.username 
        }]);
      } else if (data.type === 'user_joined') {
        setMessages(prev => [...prev, { 
          text: `${data.username} joined`, 
          system: true 
        }]);
        setOnlineCount(data.online_count);
      } else if (data.type === 'user_left') {
        setMessages(prev => [...prev, { 
          text: `${data.username} left`, 
          system: true 
        }]);
        setOnlineCount(data.online_count);
      } else if (data.type === 'video_action') {
        if (data.username !== user?.username && playerRef.current) {
          if (data.action === 'play') {
            playerRef.current.play();
            setIsPlaying(true);
          } else if (data.action === 'pause') {
            playerRef.current.pause();
            setIsPlaying(false);
          }
        }
      } else if (data.type === 'seek') {
        if (data.username !== user?.username && playerRef.current) {
          playerRef.current.seekTo(data.timestamp);
        }
      } else if (data.type === 'video_url_changed') {
        if (data.username !== user?.username) {
          setIsLoadingVideo(true);  // ✅ Show loading when URL changes
          setRoom(prev => ({ ...prev, youtube_url: data.url }));
          toast.success(`${data.username} changed the video`);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      toast.error('Connection error occurred');
    }
  }, [user?.username]);

  // Use WebSocket hook
  const { sendChat, socketRef, isConnected } = useWebSocket(room?.code, handleMessage);

  // ✅ Show connection status toast
  useEffect(() => {
    if (isConnected === false && room) {
      toast.error('Connection lost. Trying to reconnect...', {
        id: 'connection-lost',
        duration: Infinity,
      });
    } else if (isConnected === true) {
      toast.dismiss('connection-lost');
    }
  }, [isConnected, room]);

  // Send video action via WebSocket
  const sendVideoAction = useCallback((action) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'video_action',
        action,
        username: user?.username
      }));
    } else {
      toast.error('Not connected. Please wait...');
    }
  }, [socketRef, user?.username]);

  // Send seek event via WebSocket
  const sendSeek = useCallback((timestamp) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'seek',
        timestamp,
        username: user?.username
      }));
    }
  }, [socketRef, user?.username]);

  // YouTube player state change handler
  const handlePlayerStateChange = useCallback((action) => {
    sendVideoAction(action);
    setIsPlaying(action === 'play');
  }, [sendVideoAction]);

  // Seek handler
  const handleSeek = useCallback((timestamp) => {
    sendSeek(timestamp);
  }, [sendSeek]);

  // Initialize YouTube player
  const player = useYouTubePlayer(
    room?.youtube_url, 
    handlePlayerStateChange,
    handleSeek
  );

  // Store player in ref
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // ✅ Hide loading spinner after player ready
  useEffect(() => {
    if (room?.youtube_url && player) {
      const timer = setTimeout(() => {
        setIsLoadingVideo(false);
      }, 2000); // Give player time to initialize
      return () => clearTimeout(timer);
    }
  }, [room?.youtube_url, player]);

  // Video URL submission with error handling
  const handleSetVideoUrl = async (url) => {
    // ✅ Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    try {
      setIsLoadingVideo(true);
      await roomsApi.updateRoom(id, { youtube_url: url });
      setRoom(prev => ({ ...prev, youtube_url: url }));
      
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'video_url_changed',
          url: url,
          username: user?.username
        }));
      }
      
      toast.success('Video updated!');
    } catch (error) {
      console.error('Failed to update video:', error);
      toast.error('Failed to update video. Please try again.');
      setIsLoadingVideo(false);
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  // ✅ Error state
  if (roomError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-2">{roomError}</p>
          <p className="text-gray-500">Redirecting to rooms...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with connection status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>
              {/* ✅ Connection indicator */}
              {isConnected ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <Wifi size={16} />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 text-sm">
                  <WifiOff size={16} />
                  Disconnected
                </span>
              )}
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <Share2 size={18} />
              Share Room
            </button>
          </div>
        </div>

        <div className={`grid gap-4 transition-all duration-300 ${
          isChatOpen 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {/* Video Section */}
          <div className={`space-y-4 ${isChatOpen ? 'lg:col-span-2' : 'col-span-1'}`}>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition flex items-center gap-2 text-gray-700 font-medium"
            >
              {isChatOpen ? (
                <>
                  <X size={18} />
                  <span>Hide Chat</span>
                </>
              ) : (
                <>
                  <MessageSquare size={18} />
                  <span>Show Chat</span>
                </>
              )}
            </button>

            <VideoUrlForm 
              onSubmit={handleSetVideoUrl}
              initialUrl={room.youtube_url || ''}
              buttonText={room.youtube_url ? 'Change Video' : 'Set Video'}
            />

            {room.youtube_url && (
              <VideoPlayer 
                onPlay={player.play} 
                onPause={player.pause}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                isLoading={isLoadingVideo}  // ✅ Pass loading state
              />
            )}

            {/* ✅ No video state */}
            {!room.youtube_url && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-600 text-lg">
                  No video set yet. Paste a YouTube URL above to get started!
                </p>
              </div>
            )}
          </div>

          {/* Chat Section */}
          {isChatOpen && (
            <ChatPanel
              messages={messages}
              onlineCount={onlineCount}
              onSendMessage={sendChat}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          roomCode={room.code}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
