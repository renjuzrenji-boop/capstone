import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { ROLE_PERMISSIONS } from '@/config/permissions'
// import type {ApiError} from '@/api/http'
import type { AuthUser, Credentials, Permission, Role } from '@/types/auth'

export const TOKEN_KEY = 'access_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
     
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
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login(credentials)
      token.value = res.token
      user.value = res.user
      localStorage.setItem(TOKEN_KEY, res.token)
    } catch (e) {
      error.value =  'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }


  return {
    token, user, initialized, loading, error,
    isAuthenticated, role, permissions,
    hasRole, can, login, 
  }


})
