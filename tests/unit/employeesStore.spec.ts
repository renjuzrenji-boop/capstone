 import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEmployeesStore } from '@/stores/employees'
import { employeesApi } from '@/api/employees'
import type { Employee, NewEmployee } from '@/types/employee'

vi.mock('@/api/employees', () => ({
  employeesApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const employee = (id: number, name = `Emp ${id}`) => ({ id, name }) as Employee

describe('employees store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchAll loads items', async () => {
    vi.mocked(employeesApi.list).mockResolvedValue([employee(1), employee(2)])
    const store = useEmployeesStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(2)
  })

  it('create appends and sets a success message', async () => {
    vi.mocked(employeesApi.create).mockResolvedValue(employee(3))
    const store = useEmployeesStore()
    await store.create({} as NewEmployee)
    expect(store.items.map((e) => e.id)).toEqual([3])
    expect(store.msg).toBe('Employee created successfully.')
  })

  it('update replaces the matching employee', async () => {
    vi.mocked(employeesApi.list).mockResolvedValue([employee(1), employee(2)])
    vi.mocked(employeesApi.update).mockResolvedValue(employee(2, 'Updated'))
    const store = useEmployeesStore()
    await store.fetchAll()
    await store.update(2, {} as NewEmployee)
    expect(store.items[1]?.name).toBe('Updated')
    expect(store.msg).toBe('Employee updated successfully.')
  })

  it('remove deletes the employee and sets a delete message', async () => {
    vi.mocked(employeesApi.list).mockResolvedValue([employee(1), employee(2)])
    vi.mocked(employeesApi.remove).mockResolvedValue(undefined)
    const store = useEmployeesStore()
    await store.fetchAll()
    await store.remove(1)
    expect(store.items.map((e) => e.id)).toEqual([2])
    expect(store.msg).toBe('Employee deleted successfully.')
  })

  it('records an error and rethrows when the API fails', async () => {
    vi.mocked(employeesApi.create).mockRejectedValue(new Error('nope'))
    const store = useEmployeesStore()
    await expect(store.create({} as NewEmployee)).rejects.toThrow('nope')
    expect(store.error).toBe('Unable to create employee')
    expect(store.msg).toBeNull()
  })
})
