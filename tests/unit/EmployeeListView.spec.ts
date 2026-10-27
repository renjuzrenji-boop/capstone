import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EmployeeListView from '@/views/employees/EmployeeListView.vue'
import { employeesApi } from '@/api/employees'
import { useAuthStore } from '@/stores/auth'
import type { Employee } from '@/types/employee'

vi.mock('@/api/employees', () => ({
  employeesApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const makeEmployee = (id: number, overrides: Partial<Employee> = {}): Employee => ({
  id,
  name: `Employee ${id}`,
  email: `emp${id}@company.com`,
  phone: '',
  department: 'Engineering',
  designation: 'Developer',
  joiningDate: '2024-01-01',
  status: 'active',
  skills: ['Java'],
  primarySkill: 'Java',
  workExperience: '3 years',
  techStack: [],
  currentProject: { name: 'Alpha', role: '', duration: '' },
  previousProjects: [],
  completedTraning: [],
  TrainingStatus: '',
  ...overrides,
})

async function mountList(employees: Employee[], role: 'admin' | 'user' = 'admin') {
  vi.mocked(employeesApi.list).mockResolvedValue(employees)
  const auth = useAuthStore()
  auth.user = { id: '1', name: 'Tester', email: 't@t.com', role }
  const wrapper = mount(EmployeeListView, {
    global: { stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } } },
  })
  await flushPromises()
  return wrapper
}

const rows = (wrapper: Awaited<ReturnType<typeof mountList>>) => wrapper.findAll('tbody tr')

describe('EmployeeListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders fetched employees', async () => {
    const wrapper = await mountList([makeEmployee(1), makeEmployee(2)])
    expect(rows(wrapper)).toHaveLength(2)
    expect(wrapper.text()).toContain('Employee 1')
  })

  it('shows an empty state when there are no employees', async () => {
    const wrapper = await mountList([])
    expect(wrapper.text()).toContain('No employees found.')
  })

  it('filters employees by search text', async () => {
    const wrapper = await mountList([makeEmployee(1, { name: 'Anita' }), makeEmployee(2, { name: 'Rahul' })])
    await wrapper.find('input[type="search"]').setValue('rahul')
    expect(rows(wrapper)).toHaveLength(1)
    expect(wrapper.text()).toContain('Rahul')
    expect(wrapper.text()).not.toContain('Anita')
  })

  it('restores the full list when filters are cleared', async () => {
    const wrapper = await mountList([makeEmployee(1, { name: 'Anita' }), makeEmployee(2, { name: 'Rahul' })])
    await wrapper.find('input[type="search"]').setValue('rahul')
    await wrapper.findAll('button').find((b) => b.text().includes('Clear Filter'))!.trigger('click')
    expect(rows(wrapper)).toHaveLength(2)
  })

  it('paginates 10 per page and navigates between pages', async () => {
    const all = Array.from({ length: 25 }, (_, i) => makeEmployee(i + 1))
    const wrapper = await mountList(all)
    expect(rows(wrapper)).toHaveLength(10)
    expect(wrapper.text()).toContain('Showing 1–10 of 25 employees')

    await wrapper.find('button[aria-label="Page 3"]').trigger('click')
    expect(rows(wrapper)).toHaveLength(5)
    expect(wrapper.text()).toContain('Showing 21–25 of 25 employees')

    const next = wrapper.findAll('button').find((b) => b.text() === 'Next')!
    expect(next.attributes('disabled')).toBeDefined()

    await wrapper.findAll('button').find((b) => b.text() === 'Previous')!.trigger('click')
    expect(wrapper.text()).toContain('Showing 11–20 of 25 employees')
  })

  it('returns to page 1 when a filter changes', async () => {
    const wrapper = await mountList(Array.from({ length: 25 }, (_, i) => makeEmployee(i + 1)))
    await wrapper.find('button[aria-label="Page 2"]').trigger('click')
    await wrapper.find('input[type="search"]').setValue('Employee')
    expect(wrapper.text()).toContain('Showing 1–10 of 25 employees')
  })

  it('hides pagination controls when everything fits on one page', async () => {
    const wrapper = await mountList([makeEmployee(1)])
    expect(wrapper.find('button[aria-label="Page 1"]').exists()).toBe(false)
  })

  it('shows write actions only to users with write permission', async () => {
    const admin = await mountList([makeEmployee(1)], 'admin')
    expect(admin.text()).toContain('Add Employee')
    expect(admin.text()).toContain('Delete')

    setActivePinia(createPinia())
    const user = await mountList([makeEmployee(1)], 'user')
    expect(user.text()).not.toContain('Add Employee')
    expect(user.text()).not.toContain('Delete')
  })

  it('deletes an employee after confirmation and shows the message', async () => {
    vi.mocked(employeesApi.remove).mockResolvedValue(undefined)
    const wrapper = await mountList([makeEmployee(1), makeEmployee(2)])
    await wrapper.find('tbody button').trigger('click')
    expect(wrapper.find('[role="dialog"]').text()).toContain('Delete employee?')

    await wrapper.find('[role="dialog"] button.bg-red-600').trigger('click')
    await flushPromises()
    expect(employeesApi.remove).toHaveBeenCalledWith(1)
    expect(rows(wrapper)).toHaveLength(1)
    expect(wrapper.find('[role="status"]').text()).toBe('Employee deleted successfully.')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('shows an error when loading fails', async () => {
    vi.mocked(employeesApi.list).mockRejectedValue(new Error('down'))
    const auth = useAuthStore()
    auth.user = { id: '1', name: 'T', email: 't@t.com', role: 'admin' }
    const wrapper = mount(EmployeeListView, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('Something went wrong')
  })
})
