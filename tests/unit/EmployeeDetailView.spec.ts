import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EmployeeDetailView from '@/views/employees/EmployeeDetailView.vue'
import { employeesApi } from '@/api/employees'
import { useAuthStore } from '@/stores/auth'
import type { Employee } from '@/types/employee'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ params: { id: '7' } }),
}))
vi.mock('@/api/employees', () => ({
  employeesApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const employee: Employee = {
  id: 7,
  name: 'Anita Sharma',
  email: 'anita@company.com',
  phone: '',
  department: 'Engineering',
  designation: 'Senior Developer',
  joiningDate: '2021-03-15',
  status: 'active',
  skills: ['Java', 'HTML'],
  primarySkill: 'Java',
  workExperience: '3 years',
  techStack: ['Java'],
  currentProject: { name: 'Project Alpha', role: 'Developer', duration: '6 months' },
  previousProjects: ['Project Beta'],
  completedTraning: ['Vue'],
  TrainingStatus: 'Completed',
}

async function mountDetail(role: 'admin' | 'user' = 'admin') {
  const auth = useAuthStore()
  auth.user = { id: '1', name: 'T', email: 't@t.com', role }
  const wrapper = mount(EmployeeDetailView, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
  await flushPromises()
  return wrapper
}

describe('EmployeeDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(employeesApi.get).mockResolvedValue(employee)
  })

  it('loads and displays the employee details', async () => {
    const wrapper = await mountDetail()
    expect(employeesApi.get).toHaveBeenCalledWith(7)
    expect(wrapper.text()).toContain('Anita Sharma')
    expect(wrapper.text()).toContain('Java, HTML')
    expect(wrapper.text()).toContain('Project Alpha')
    expect(wrapper.text()).toContain('Project Beta')
    expect(wrapper.text()).toContain('Completed')
  })

  it('shows a dash for missing values', async () => {
    vi.mocked(employeesApi.get).mockResolvedValue({ ...employee, phone: '', previousProjects: [] })
    const wrapper = await mountDetail()
    expect(wrapper.text()).toContain('—')
  })

  it('shows an error when the employee cannot be loaded', async () => {
    vi.mocked(employeesApi.get).mockRejectedValue(new Error('missing'))
    const wrapper = await mountDetail()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('hides edit and delete for users without write permission', async () => {
    const wrapper = await mountDetail('user')
    expect(wrapper.text()).not.toContain('Delete')
    expect(wrapper.text()).not.toContain('Edit')
  })

  it('deletes after confirmation and navigates back to the list', async () => {
    vi.mocked(employeesApi.remove).mockResolvedValue(undefined)
    const wrapper = await mountDetail('admin')
    await wrapper.findAll('button').find((b) => b.text() === 'Delete')!.trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await wrapper.find('[role="dialog"] button.bg-red-600').trigger('click')
    await flushPromises()
    expect(employeesApi.remove).toHaveBeenCalledWith(7)
    expect(push).toHaveBeenCalledWith('/app/employees')
  })

  it('closes the confirmation dialog on cancel without deleting', async () => {
    const wrapper = await mountDetail('admin')
    await wrapper.findAll('button').find((b) => b.text() === 'Delete')!.trigger('click')
    await wrapper.findAll('[role="dialog"] button').find((b) => b.text() === 'Cancel')!.trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(employeesApi.remove).not.toHaveBeenCalled()
  })
})
