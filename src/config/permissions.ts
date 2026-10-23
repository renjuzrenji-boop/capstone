import type { Permission, Role } from '@/types/auth'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['dashboard:view', 'users:read', 'users:write', 'reports:read', 'settings:manage'],
  manager: ['dashboard:view', 'users:read', 'reports:read'],
  user: ['dashboard:view'],
}

