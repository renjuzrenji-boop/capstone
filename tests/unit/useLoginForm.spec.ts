import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { authApi } from '@/api/auth'
import { useLoginForm } from '@/composables/useLoginForm'

const { push, route } = vi.hoisted(() => ({
  push: vi.fn(),
  route: { query: {} as Record<string, string | string[] | null | undefined> },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
vi.mock('@/api/auth', () => ({ authApi: { login: vi.fn(), me: vi.fn() } }))

const mountLoginForm = () => {
  let form!: ReturnType<typeof useLoginForm>
  const wrapper = mount(defineComponent({
    setup() {
      form = useLoginForm()
      return () => null
    },
  }))
  return { wrapper, form }
}

describe('useLoginForm', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.query = {}
  })

  it('validates email and minimum password length', () => {
    const { form } = mountLoginForm()
    expect(form.emailValid()).toBe(false)
    expect(form.passwordValid()).toBe(false)

    form.form.email = 'person@example.com'
    form.form.password = 'secret'
    expect(form.emailValid()).toBe(true)
    expect(form.passwordValid()).toBe(true)
  })

  it('marks the form touched and does not log in with invalid input', async () => {
    const { form } = mountLoginForm()
    await form.submit()

    expect(form.touched.value).toBe(true)
    expect(authApi.login).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('logs in and redirects to the requested page', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: 'token',
      user: { id: '1', name: 'Tester', email: 'test@example.com', role: 'admin' },
    })
    route.query = { redirect: '/app/employees' }
    const { form } = mountLoginForm()
    form.form.email = 'test@example.com'
    form.form.password = 'secret1'

    await form.submit()

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret1',
    })
    expect(push).toHaveBeenCalledWith('/app/employees')
  })

  it('uses the dashboard fallback for a non-string redirect and keeps the user on failure', async () => {
    route.query = { redirect: ['/app/employees'] }
    vi.mocked(authApi.login).mockRejectedValue(new Error('bad credentials'))
    const { form } = mountLoginForm()
    form.form.email = 'test@example.com'
    form.form.password = 'secret1'

    await form.submit()

    expect(push).not.toHaveBeenCalled()
    expect(form.auth.error).toBe('Login failed')
  })
})
