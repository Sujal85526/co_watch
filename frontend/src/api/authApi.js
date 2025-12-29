import httpClient from './httpClient'
import { toast } from 'react-hot-toast'

export async function login(username, password) {
  try {
    const response = await httpClient.post('auth/login/', { username, password })
    localStorage.setItem('cowatch_token', response.data.token)
    localStorage.setItem('cowatch_username', response.data.user.username)
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Login failed')
    throw error
  }
}

export async function register(username, password) {
  try {
    const response = await httpClient.post('auth/register/', { username, password })
    localStorage.setItem('cowatch_token', response.data.token)
    localStorage.setItem('cowatch_username', response.data.user.username)
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Registration failed')
    throw error
  }
}

export function logout() {
  localStorage.removeItem('cowatch_token')
  localStorage.removeItem('cowatch_username')
}
