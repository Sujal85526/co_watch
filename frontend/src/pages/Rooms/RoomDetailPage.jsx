import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, MessageSquare, X } from 'lucide-react';
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
  
  // ✅ Use ref to store player instance for callbacks
  const playerRef = useRef(null);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await roomsApi.getRoom(id);
        setRoom(data);
      } catch (error) {
        toast.error('Failed to load room');
        navigate('/rooms');
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
        // Only handle actions from other users
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
          setRoom(prev => ({ ...prev, youtube_url: data.url }));
          toast.success(`${data.username} changed the video`);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [user?.username]);

  // Use WebSocket hook
  const { sendChat, socketRef } = useWebSocket(room?.code, handleMessage);

  // Send video action via WebSocket
  const sendVideoAction = useCallback((action) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'video_action',
        action,
        username: user?.username
      }));
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

  // ✅ Store player in ref for use in callbacks
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Video URL submission
  const handleSetVideoUrl = async (url) => {
    try {
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
      toast.error('Failed to update video');
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

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>
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
              />
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
