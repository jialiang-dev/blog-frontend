import axios from 'axios'

// In Docker production, Nginx reverse-proxies /api/* → backend:8080
// In dev, Vite proxies or you can set VITE_API_BASE=http://localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 10000,
})

export default api
