import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { router } from '@/router'

vi.mock('@/api/auth', () => ({ authApi: { login: vi.fn(), me: vi.fn() } }))

describe('router access control', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('redirects guests from protected routes to login with the intended destination', async () => {
    await router.push('/app/employees?search=Anita')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/app/employees?search=Anita')
  })

  it('redirects authenticated users away from the guest-only login page', async () => {
    const auth = useAuthStore()
    auth.token = 'valid-token'
    auth.user = { id: '1', name: 'Tester', email: 'test@example.com', role: 'user' }

    await router.push('/')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redirects users who lack a route permission to the dashboard', async () => {
    const auth = useAuthStore()
    auth.token = 'valid-token'
    auth.user = { id: '1', name: 'Tester', email: 'test@example.com', role: 'user' }

    await router.push('/app/employees')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('allows a manager to access employee pages but not employee write routes', async () => {
    const auth = useAuthStore()
    auth.token = 'valid-token'
    auth.user = { id: '1', name: 'Tester', email: 'test@example.com', role: 'manager' }

    await router.push('/app/employees')
    expect(router.currentRoute.value.name).toBe('employees')

    await router.push('/app/employees/new')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redirects to login when restoring an expired saved session', async () => {
    localStorage.setItem('access_token', 'expired-token')
    vi.mocked(authApi.me).mockRejectedValue(new Error('expired'))

    await router.push('/app/employees')

    expect(authApi.me).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.name).toBe('login')
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})
