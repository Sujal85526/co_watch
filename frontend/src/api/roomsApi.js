import httpClient from './httpClient.js'
import { toast } from 'react-hot-toast'

export async function listRooms() {
  try {
    const response = await httpClient.get('rooms/')
    return response.data
  } catch (error) {
    toast.error('Failed to load rooms')
    return []
  }
}

export async function getRoom(id) {
  try {
    const response = await httpClient.get(`rooms/${id}/`)
    return response.data
  } catch (error) {
    toast.error('Failed to load room')
    throw error
  }
}

export async function createRoom(name) {
  try {
    const response = await httpClient.post('rooms/', { name })
    toast.success('Room created successfully!')
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Failed to create room')
    throw error
  }
}
