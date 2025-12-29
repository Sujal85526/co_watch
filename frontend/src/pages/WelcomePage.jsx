import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Users, Plus } from 'lucide-react'

export default function WelcomePage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-8 text-white">
      <h1 className="text-5xl font-bold mb-8 drop-shadow-2xl">Welcome back, {user.username}!</h1>
      <p className="text-xl mb-12 opacity-90 max-w-md text-center">Your watch-together platform is ready.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        <Link 
          to="/rooms" 
          className="group bg-white text-indigo-600 px-8 py-6 rounded-2xl font-bold text-lg hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center space-y-3 h-32 justify-center"
        >
          <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span>Go to Your Rooms</span>
        </Link>
        <Link 
          to="/rooms" 
          className="group bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-6 rounded-2xl font-bold text-lg hover:bg-white hover:text-indigo-600 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center space-y-3 h-32 justify-center"
        >
          <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span>Create New Room</span>
        </Link>
      </div>
    </div>
  )
}
