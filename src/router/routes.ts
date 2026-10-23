import type { RouteRecordRaw } from 'vue-router'
// import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { Permission, Role } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Must be logged in */
    requiresAuth?: boolean
    /** Only for logged-out users (e.g. login page) */
    guestOnly?: boolean
    /** User must have ONE of these roles */
    roles?: Role[]
    /** User must have ALL of these permissions */
    permissions?: Permission[]
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Login', guestOnly: true },
  },
  {
    path: '/app/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: 'Dashboard', requiresAuth: true, permissions: ['dashboard:view'] },
  },
]