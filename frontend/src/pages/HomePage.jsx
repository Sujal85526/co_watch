import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-8 text-white">
      <h1 className="text-6xl font-bold mb-8 drop-shadow-2xl">CoWatch</h1>
      <p className="text-xl mb-12 opacity-90 max-w-md text-center">Watch together, anywhere</p>
      <div className="space-x-4 flex flex-col sm:flex-row gap-4">
        <Link 
          to="/login" 
          className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 text-center"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="bg-transparent border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-indigo-600 transition-all duration-300 text-center"
        >
          Create Account
        </Link>
      </div>
    </div>
  )
}
