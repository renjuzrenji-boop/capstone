import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { ROLE_PERMISSIONS } from '@/config/permissions'
import { useApiRequest } from '@/composables/useApiRequest'
// import type {ApiError} from '@/api/http'
import type { AuthUser, Credentials, Permission, Role } from '@/types/auth'

export const TOKEN_KEY = 'access_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const { loading, error, execute } = useApiRequest()
  let restorePromise: Promise<void> | null = null
     
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const permissions = computed<readonly Permission[]>(() =>
    role.value ? ROLE_PERMISSIONS[role.value] : [],
  )

  function hasRole(...roles: Role[]) {
    return !!role.value && roles.includes(role.value)
  }

  function can(...required: Permission[]) {
    return required.every((p) => permissions.value.includes(p))
  }

  async function login(credentials: Credentials) {
    await execute(async () => {
      const res = await authApi.login(credentials)
      token.value = res.token
      user.value = res.user
      localStorage.setItem(TOKEN_KEY, res.token)
    }, 'Login failed')
  }


  async function restore() {
    if (initialized.value) return

    if (!restorePromise) {
      restorePromise = (async () => {
        try {
          if (token.value && !user.value) user.value = await authApi.me()
        } catch {
          token.value = null
          localStorage.removeItem(TOKEN_KEY)
        } finally {
          initialized.value = true
        }
      })()
    }

    await restorePromise
    restorePromise = null
  }

  return {
    token, user, initialized, loading, error,
    isAuthenticated, role, permissions,
    hasRole, can, login, restore,
  }


})
