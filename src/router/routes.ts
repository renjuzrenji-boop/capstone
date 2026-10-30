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

const employeeFormView = () => import('@/views/employees/EmployeeFormView.vue')

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
  {
    path: '/app/employees',
    component: () => import('@/views/employees/EmployeeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'employees',
        component: () => import('@/views/employees/EmployeeListView.vue'),
        meta: { title: 'Employees', permissions: ['employees:read'] },
      },
      {
        path: 'new',
        name: 'employee-new',
        component: employeeFormView,
        meta: { title: 'Add Employee', permissions: ['employees:write'] },
      },
      {
        path: ':id',
        name: 'employee-detail',
        component: () => import('@/views/employees/EmployeeDetailView.vue'),
        meta: { title: 'Employee Details', permissions: ['employees:read'] },
      },
      {
        path: ':id/edit',
        name: 'employee-edit',
        component: employeeFormView,
        meta: { title: 'Edit Employee', permissions: ['employees:write'] },
      },
    ],
  },
]