import axios from 'axios'
import { env } from '../config/env'

const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function errorMessage(e: unknown, fallback = 'Something went wrong') {
  return (axios.isAxiosError(e) && e.response?.data?.message) || fallback
}

export default http