import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { employeesApi } from '@/api/employees'
import { useEmployeeForm } from '@/composables/useEmployeeForm'
import type { Employee } from '@/types/employee'

const { push, route } = vi.hoisted(() => ({
  push: vi.fn(),
  route: { params: {} as Record<string, string> },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
vi.mock('@/api/employees', () => ({
  employeesApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const employee: Employee = {
  id: 5,
  name: 'Existing Employee',
  email: 'existing@example.com',
  phone: '',
  department: 'Engineering',
  designation: 'Developer',
  joiningDate: '2020-03-15',
  status: 'active',
  skills: ['Java'],
  primarySkill: 'Java',
  workExperience: '3 years',
  techStack: ['Vue'],
  currentProject: { name: 'Alpha', role: 'Developer', duration: '6 months' },
  previousProjects: ['Beta'],
  completedTraning: ['Vue'],
  TrainingStatus: 'Completed',
}

const mountEmployeeForm = async () => {
  let form!: ReturnType<typeof useEmployeeForm>
  const wrapper = mount(defineComponent({
    setup() {
      form = useEmployeeForm()
      return () => null
    },
  }))
  await flushPromises()
  return { wrapper, form }
}

describe('useEmployeeForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.params = {}
  })

  it('reports required-field errors and does not submit invalid data', async () => {
    const { form } = await mountEmployeeForm()
    await form.submit()

    expect(form.errors.value).toEqual(expect.objectContaining({
      name: 'Name is required',
      email: 'Enter a valid email',
      department: 'Department is required',
      designation: 'Designation is required',
    }))
    expect(employeesApi.create).not.toHaveBeenCalled()
  })

  it('validates optional phone numbers and joining dates', async () => {
    const { form } = await mountEmployeeForm()
    form.form.name = 'Jane Doe'
    form.form.email = 'jane@example.com'
    form.form.department = 'Engineering'
    form.form.designation = 'Developer'
    form.form.phone = 'not-a-phone'
    form.form.joiningDate = '2000-01-01'

    await form.submit()

    expect(form.errors.value.phone).toBe('Enter a valid phone number')
    expect(form.errors.value.joiningDate).toBe('Past dates are not allowed')
    expect(employeesApi.create).not.toHaveBeenCalled()
  })

  it('converts comma-separated fields and submits trimmed values', async () => {
    vi.mocked(employeesApi.create).mockResolvedValue({ ...employee, id: 9 })
    const { form } = await mountEmployeeForm()
    form.form.name = '  Jane Doe  '
    form.form.email = ' jane@example.com '
    form.form.department = 'Engineering'
    form.form.designation = 'Developer'
    form.skillsText.value = 'Java, HTML ,, Vue'
    form.techStackText.value = ' TypeScript, Vue '
    form.previousProjectsText.value = 'Alpha, , Beta'
    form.completedTrainingText.value = 'Vue, Testing'

    await form.submit()

    expect(employeesApi.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Doe',
      email: 'jane@example.com',
      skills: ['Java', 'HTML', 'Vue'],
      techStack: ['TypeScript', 'Vue'],
      previousProjects: ['Alpha', 'Beta'],
      completedTraning: ['Vue', 'Testing'],
    }))
    expect(push).toHaveBeenCalledWith('/app/employees')
  })

  it('loads an existing employee and updates it with its original minimum date', async () => {
    route.params = { id: '5' }
    vi.mocked(employeesApi.get).mockResolvedValue(employee)
    vi.mocked(employeesApi.update).mockResolvedValue({ ...employee, name: 'Updated' })

    const { form } = await mountEmployeeForm()
    expect(employeesApi.get).toHaveBeenCalledWith(5)
    expect(form.isEdit.value).toBe(true)
    expect(form.form.name).toBe('Existing Employee')
    expect(form.minDate.value).toBe('2020-03-15')

    form.form.name = 'Updated'
    await form.submit()

    expect(employeesApi.update).toHaveBeenCalledWith(5, expect.objectContaining({ name: 'Updated' }))
    expect(push).toHaveBeenCalledWith('/app/employees')
  })
})
