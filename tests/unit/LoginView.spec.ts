import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginView from '@/views/auth/LoginView.vue'
import { authApi } from '@/api/auth'

const push = vi.fn()
const route = { query: {} as Record<string, string> }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
vi.mock('@/api/auth', () => ({ authApi: { login: vi.fn(), me: vi.fn() } }))

const mountView = () => mount(LoginView)

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.query = {}
  })

  it('shows validation errors and does not call the API for invalid input', async () => {
    const wrapper = mountView()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Enter a valid email')
    expect(wrapper.text()).toContain('At least 6 characters')
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('logs in and redirects to the dashboard by default', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: 't',
      user: { id: '1', name: 'Alice', email: 'a@b.com', role: 'admin' },
    })
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('secret1')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' })
    expect(push).toHaveBeenCalledWith('/app/dashboard')
  })

  it('redirects to the requested page after login', async () => {
    route.query = { redirect: '/app/employees' }
    vi.mocked(authApi.login).mockResolvedValue({
      token: 't',
      user: { id: '1', name: 'Alice', email: 'a@b.com', role: 'admin' },
    })
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('secret1')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(push).toHaveBeenCalledWith('/app/employees')
  })

  it('shows an error and stays on the page when login fails', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('bad'))
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').setValue('a@b.com')
    await wrapper.find('input[type="password"]').setValue('secret1')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('Login failed')
    expect(push).not.toHaveBeenCalled()
  })
})
