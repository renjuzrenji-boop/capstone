export const ROLES = ['admin', 'manager', 'user'] as const
export type Role = (typeof ROLES)[number]

export type Permission = | 'dashboard:view'
  | 'users:read'
  | 'users:write'
  | 'reports:read'
  | 'settings:manage'

export interface Credentials {
  email: string
  password: string
}

export interface AuthUser {
 id: string
  name: string
  email: string
  role: Role
}

export interface LoginResponse {
    token: string
    user: AuthUser
}