import http from './http'
import type { User, NewUser } from '../types/user'

export const usersApi = {
  list: () => http.get<User[]>('/users').then((r:any) => r.data),
  get: (id: string) => http.get<User>(`/users/${id}`).then((r:any) => r.data),
  create: (payload: NewUser) => http.post<User>('/users', payload).then((r:any) => r.data),
  remove: (id: string) => http.delete(`/users/${id}`).then(() => undefined),
}