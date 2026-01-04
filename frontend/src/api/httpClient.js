import axios from 'axios'

const httpClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cowatch_token')
  
  // ✅ Only add token if NOT an auth endpoint
  if (token && !config.url.includes('auth/')) {
    config.headers.Authorization = `Token ${token}`
  }
  
  return config
})

export default httpClient
