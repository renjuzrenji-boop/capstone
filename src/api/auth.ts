import http from './http'
import type { AuthUser, Credentials, LoginResponse } from '@/types/auth'

export const authApi = {
  login: (credentials: Credentials) =>
    http.post<LoginResponse>('/auth/login', credentials).then((r) => r.data),
  me: () => http.get<AuthUser>('/auth/me').then((r) => r.data),
}