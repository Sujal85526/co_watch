import axios from 'axios'

const httpClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cowatch_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export default httpClient
