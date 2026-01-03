import axios from 'axios'

const httpClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cowatch_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export default httpClient
