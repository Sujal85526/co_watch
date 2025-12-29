import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { listRooms, createRoom } from '../../api/roomsApi.js'
import { Plus, Users, Loader2 } from 'lucide-react'

export default function RoomsListPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [roomName, setRoomName] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const data = await listRooms()
      setRooms(data)
    } catch (error) {
      console.error('Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) return
    
    setCreating(true)
    try {
      await createRoom(roomName.trim())
      setRoomName('')
      fetchRooms()
    } catch (error) {
      console.error('Create room failed')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="w-10 h-10 mr-3 text-indigo-600" />
            Your Rooms
          </h1>
          <p className="text-gray-600">Manage your watch parties</p>
        </div>
        
        <form onSubmit={handleCreateRoom} className="flex bg-white shadow-lg rounded-2xl border p-3 max-w-md">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="flex-1 px-4 py-3 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl outline-none bg-transparent placeholder-gray-500"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !roomName.trim()}
            className="ml-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg whitespace-nowrap min-w-[120px]"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create</span>
              </>
            )}
          </button>
        </form>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30">
          <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No rooms yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first watch party room to get started!</p>
          <form onSubmit={handleCreateRoom} className="max-w-lg mx-auto flex shadow-lg rounded-2xl overflow-hidden">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Movie Night with Friends"
              className="flex-1 px-6 py-4 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
            />
            <button
              type="submit"
              disabled={!roomName.trim()}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg whitespace-nowrap min-w-[150px]"
            >
              Create Room
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Link 
              key={room.id} 
              to={`/rooms/${room.id}`}
              className="group block p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex-1 pr-4">
                  {room.name}
                </h3>
                <div className="bg-indigo-100 p-3 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                  <span className="text-indigo-700 font-mono text-sm font-bold">{room.code}</span>
                </div>
              </div>
              <div className="space-y-2 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Owner: <span className="font-medium ml-1">{room.owner}</span>
                </div>
                {room.youtube_url && (
                  <div className="text-sm text-gray-500">YouTube video ready</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {new Date(room.created_at).toLocaleDateString()}
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all group-hover:shadow-lg">
                  Join Room →
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
