import { createContext, useState, useEffect } from 'react'
import { login, register, logout as apiLogout } from '../api/authApi.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cowatch_token')
    const username = localStorage.getItem('cowatch_username')
    if (token && username) {
      setUser({ username })  // ← Works with new format
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const loginUser = async (username, password) => {
    const data = await login(username, password)
    setUser({ username: data.username })  // ← FIXED
    setIsAuthenticated(true)
  }

  const registerUser = async (username, password) => {
    const data = await register(username, password)
    setUser({ username: data.username })  // ← FIXED
    setIsAuthenticated(true)
  }

  const logoutUser = () => {
    apiLogout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login: loginUser,
      register: registerUser,
      logout: logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
