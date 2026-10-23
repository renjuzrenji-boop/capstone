import type { AuthUser, Role } from './auth'

export type User = AuthUser

export interface NewUser {
  name: string
  email: string
  password: string
  role: Role
}