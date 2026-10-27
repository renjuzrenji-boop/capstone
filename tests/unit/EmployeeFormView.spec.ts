import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EmployeeFormView from '@/views/employees/EmployeeFormView.vue'
import { employeesApi } from '@/api/employees'
import type { Employee } from '@/types/employee'

const push = vi.fn()
const route = { params: {} as Record<string, string> }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
vi.mock('@/api/employees', () => ({
  employeesApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const stubs = { RouterLink: { template: '<a><slot /></a>' } }
const mountForm = async () => {
  const wrapper = mount(EmployeeFormView, { global: { stubs } })
  await flushPromises()
  return wrapper
}
const field = (wrapper: Awaited<ReturnType<typeof mountForm>>, label: string) =>
  wrapper.findAll('label').find((l) => l.text().startsWith(label))!.find('input')

async function fillRequired(wrapper: Awaited<ReturnType<typeof mountForm>>) {
  await field(wrapper, 'Name')!.setValue('  Jane Doe ')
  await field(wrapper, 'Email')!.setValue('jane@company.com')
  await field(wrapper, 'Department')!.setValue('Engineering')
  await field(wrapper, 'Designation')!.setValue('Developer')
}

describe('EmployeeFormView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.params = {}
  })

  it('renders the add form', async () => {
    const wrapper = await mountForm()
    expect(wrapper.find('h1').text()).toBe('Add Employee')
  })

  it('shows validation errors and does not submit an empty form', async () => {
    const wrapper = await mountForm()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Enter a valid email')
    expect(wrapper.text()).toContain('Department is required')
    expect(wrapper.text()).toContain('Designation is required')
    expect(employeesApi.create).not.toHaveBeenCalled()
  })

  it('rejects an invalid phone number', async () => {
    const wrapper = await mountForm()
    await fillRequired(wrapper)
    await field(wrapper, 'Phone')!.setValue('abc')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Enter a valid phone number')
    expect(employeesApi.create).not.toHaveBeenCalled()
  })

  it('rejects a joining date in the past', async () => {
    const wrapper = await mountForm()
    await fillRequired(wrapper)
    await field(wrapper, 'Joining date')!.setValue('2000-01-01')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Past dates are not allowed')
  })

  it('creates an employee with trimmed values and parsed lists, then redirects', async () => {
    vi.mocked(employeesApi.create).mockResolvedValue({ id: 9 } as Employee)
    const wrapper = await mountForm()
    await fillRequired(wrapper)
    const skills = field(wrapper, 'Skills')!
    await skills.setValue('Java, HTML ,, Vue')
    await skills.trigger('change')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(employeesApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@company.com',
        skills: ['Java', 'HTML', 'Vue'],
      }),
    )
    expect(push).toHaveBeenCalledWith('/app/employees')
  })

  it('shows the API error and stays on the page when saving fails', async () => {
    vi.mocked(employeesApi.create).mockRejectedValue(new Error('nope'))
    const wrapper = await mountForm()
    await fillRequired(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('Unable to create employee')
    expect(push).not.toHaveBeenCalled()
  })

  it('loads an existing employee in edit mode and updates it', async () => {
    route.params = { id: '5' }
    vi.mocked(employeesApi.get).mockResolvedValue({
      id: 5,
      name: 'Existing',
      email: 'e@company.com',
      phone: '',
      department: 'HR',
      designation: 'Lead',
      joiningDate: '2020-01-01',
      status: 'active',
      skills: ['Java'],
      primarySkill: '',
      workExperience: '',
      techStack: [],
      currentProject: { name: '', role: '', duration: '' },
      previousProjects: [],
      completedTraning: [],
      TrainingStatus: '',
    })
    vi.mocked(employeesApi.update).mockResolvedValue({ id: 5 } as Employee)

    const wrapper = await mountForm()
    expect(wrapper.find('h1').text()).toBe('Edit Employee')
    expect((field(wrapper, 'Name')!.element as HTMLInputElement).value).toBe('Existing')

    await field(wrapper, 'Name')!.setValue('Renamed')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(employeesApi.update).toHaveBeenCalledWith(5, expect.objectContaining({ name: 'Renamed' }))
    expect(push).toHaveBeenCalledWith('/app/employees')
  })
})
