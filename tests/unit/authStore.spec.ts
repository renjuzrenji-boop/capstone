import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { TOKEN_KEY, useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import type { AuthUser } from '@/types/auth'

vi.mock('@/api/auth', () => ({ authApi: { login: vi.fn(), me: vi.fn() } }))

const makeUser = (role: AuthUser['role']): AuthUser => ({
  id: '1',
  name: 'Tester',
  email: 't@example.com',
  role,
})

// The store reads the saved token when it is created, so seed storage first.
const createStore = (savedToken?: string) => {
  if (savedToken) localStorage.setItem(TOKEN_KEY, savedToken)
  setActivePinia(createPinia())
  return useAuthStore()
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts logged out', () => {
      const store = createStore()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.role).toBeNull()
      expect(store.permissions).toEqual([])
    })

    it('picks up a saved token from localStorage', () => {
      const store = createStore('saved')
      expect(store.token).toBe('saved')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('stores the token and user and persists the token', async () => {
      vi.mocked(authApi.login).mockResolvedValue({ token: 'abc', user: makeUser('admin') })
      const store = createStore()
      await store.login({ email: 't@example.com', password: 'secret1' })

      expect(authApi.login).toHaveBeenCalledWith({ email: 't@example.com', password: 'secret1' })
      expect(store.token).toBe('abc')
      expect(store.user?.name).toBe('Tester')
      expect(store.isAuthenticated).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(localStorage.getItem(TOKEN_KEY)).toBe('abc')
    })

    it('sets an error, rethrows and stays logged out on failure', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('bad credentials'))
      const store = createStore()

      await expect(store.login({ email: 'a@b.com', password: 'wrong1' })).rejects.toThrow('bad credentials')
      expect(store.error).toBe('Login failed')
      expect(store.isAuthenticated).toBe(false)
      expect(store.loading).toBe(false)
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    })

    it('clears a previous error on the next attempt', async () => {
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('bad'))
      const store = createStore()
      await expect(store.login({ email: 'a@b.com', password: 'wrong1' })).rejects.toThrow()
      expect(store.error).toBe('Login failed')

      vi.mocked(authApi.login).mockResolvedValue({ token: 'abc', user: makeUser('user') })
      await store.login({ email: 'a@b.com', password: 'right12' })
      expect(store.error).toBeNull()
    })
  })

  describe('roles and permissions', () => {
    it.each([
      ['admin', ['employees:read', 'employees:write', 'users:write']],
      ['manager', ['employees:read', 'reports:read']],
      ['user', ['dashboard:view']],
    ] as const)('grants the %s role its permissions', (role, granted) => {
      const store = createStore()
      store.user = makeUser(role)
      expect(store.role).toBe(role)
      expect(store.can(...granted)).toBe(true)
    })

    it('denies permissions a role does not have', () => {
      const store = createStore()
      store.user = makeUser('manager')
      expect(store.can('employees:write')).toBe(false)

      store.user = makeUser('user')
      expect(store.can('employees:read')).toBe(false)
    })

    it('can() requires every listed permission', () => {
      const store = createStore()
      store.user = makeUser('manager')
      expect(store.can('employees:read', 'reports:read')).toBe(true)
      expect(store.can('employees:read', 'employees:write')).toBe(false)
    })

    it('denies everything when logged out', () => {
      const store = createStore()
      expect(store.can('dashboard:view')).toBe(false)
    })

    it('hasRole() matches any of the given roles', () => {
      const store = createStore()
      store.user = makeUser('manager')
      expect(store.hasRole('admin', 'manager')).toBe(true)
      expect(store.hasRole('admin')).toBe(false)
    })

    it('hasRole() is false when logged out', () => {
      const store = createStore()
      expect(store.hasRole('admin', 'manager', 'user')).toBe(false)
    })
  })

  describe('restore', () => {
    it('loads the user when a token is saved', async () => {
      vi.mocked(authApi.me).mockResolvedValue(makeUser('admin'))
      const store = createStore('saved')
      await store.restore()

      expect(authApi.me).toHaveBeenCalledOnce()
      expect(store.user?.role).toBe('admin')
      expect(store.isAuthenticated).toBe(true)
      expect(store.initialized).toBe(true)
    })

    it('does not call the API when there is no saved token', async () => {
      const store = createStore()
      await store.restore()

      expect(authApi.me).not.toHaveBeenCalled()
      expect(store.isAuthenticated).toBe(false)
      expect(store.initialized).toBe(true)
    })

    it('clears an invalid token when the API rejects it', async () => {
      vi.mocked(authApi.me).mockRejectedValue(new Error('expired'))
      const store = createStore('stale')
      await store.restore()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
      expect(store.initialized).toBe(true)
    })

    it('only restores once', async () => {
      vi.mocked(authApi.me).mockResolvedValue(makeUser('user'))
      const store = createStore('saved')
      await store.restore()
      await store.restore()
      expect(authApi.me).toHaveBeenCalledOnce()
    })
  })
})
