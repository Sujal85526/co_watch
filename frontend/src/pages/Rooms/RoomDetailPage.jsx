import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getRoom } from '../../api/roomsApi.js'
import { useWebSocket } from '../../hooks/useWebSocket.js'
import { ArrowLeft, Share2, Play, MessageCircle, Users, X, Copy, ChevronRight } from 'lucide-react'

export default function RoomDetailPage() {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  // ✅ FIXED: Get full WebSocket object
  const ws = useWebSocket(room?.code || id)

  useEffect(() => {
    fetchRoom()
  }, [id])

  const fetchRoom = async () => {
    setLoading(true)
    try {
      const data = await getRoom(id)
      setRoom(data)
    } catch (error) {
      console.error('Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: WebSocket message handler
  useEffect(() => {
    if (!ws?.socketRef?.current) return

    const socket = ws.socketRef.current

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data])
        }
      } catch (e) {
        console.error('WS message parse error:', e)
      }
    }

    const handleOpen = () => setIsConnected(true)
    const handleClose = () => setIsConnected(false)

    socket.addEventListener('message', handleMessage)
    socket.addEventListener('open', handleOpen)
    socket.addEventListener('close', handleClose)

    return () => {
      socket.removeEventListener('message', handleMessage)
      socket.removeEventListener('open', handleOpen)
      socket.removeEventListener('close', handleClose)
    }
  }, [ws, room?.code])

  // ✅ Send chat message
const handleSendMessage = (e) => {
  e.preventDefault()
  if (chatInput.trim() && ws?.sendChat) {
    ws.sendChat(chatInput.trim()) 
    setChatInput('')
  }
}



if (loading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link to="/rooms" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Rooms
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="font-mono bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{room.code}</span>
                <span>Owner: {room.owner}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowShare(true)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Player + RIGHT Chat Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-6">
          {/* VIDEO PLAYER - LEFT SIDE */}
          <div className="flex-1 max-w-5xl">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white text-center shadow-2xl">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden mx-auto max-w-4xl shadow-2xl mb-8">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                  <Play className="w-32 h-32 text-white/80" />
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all shadow-lg">
                  <Play className="w-5 h-5" />
                  <span>Play/Pause</span>
                </button>
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.5h13m-2.5-15l1.4-1.4a2 2 0 012.832 0l2.5 2.5a2 2 0 010 2.832l-5.262 5.262A2 2 0 0020.262 19a2 2 0 01-3.237-3.175L15 17.25m0 0L9 11l1.6-1.6s2.8-1.225 4.4 1.375c.4.5.62 1.15.62 1.85 0 .688-.215 1.33-.62 1.85z" />
                  </svg>
                  <span>Seek</span>
                </button>
              </div>
            </div>

            {/* TOGGLE CHAT BUTTON */}
            {!showChat && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowChat(true)}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Open Chat</span>
                </button>
              </div>
            )}
          </div>

          {/* CHAT SIDEBAR - RIGHT SIDE */}
          {showChat && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 h-fit sticky top-28">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-3xl">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5" />
                    <h4 className="font-bold text-lg">Live Chat</h4>
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                  <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="h-72 p-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-gray-500 italic text-center mt-24 text-sm">
                      {isConnected ? 'No messages yet. Say hi!' : 'Connecting...'}
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className="mb-3 last:mb-0">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {msg.username?.slice(0, 2).toUpperCase() || '??'}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-gray-900">{msg.username || 'Anonymous'}</span>
                            <p className="text-sm text-gray-700 ml-1">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                      disabled={!isConnected}
                    />
                    <button 
                      type="submit" 
                      disabled={!isConnected || !chatInput.trim()}
                      className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl shadow-md disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Invite Friends</h3>
              <button onClick={() => setShowShare(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white text-center">
                <div className="font-mono text-3xl font-bold tracking-wider mb-2">{room.code}</div>
                <p className="text-indigo-100">Share this code</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Link</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={`http://localhost:5173/rooms/${room.id}`} 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  />
                  <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg">
                    <Copy className="w-5 h-5 inline mr-2" />
                    Copy
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowShare(false)}
                className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
