import { ref } from 'vue'
import { defineStore } from 'pinia'
import { employeesApi } from '@/api/employees'
import { useApiRequest } from '@/composables/useApiRequest'
import type { Employee, NewEmployee } from '@/types/employee'

export const useEmployeesStore = defineStore('employees', () => {
  const items = ref<Employee[]>([])
  const { loading, error, msg, execute } = useApiRequest()

  const fetchAll = () => execute(async () => { items.value = await employeesApi.list() })
  const fetchOne = (id: number) => execute(() => employeesApi.get(id))

  const create = (payload: NewEmployee) =>
    execute(async () => {
      const created = await employeesApi.create(payload)
      items.value.push(created)
      return created
    }, 'Unable to create employee', 'Employee created successfully.')

  const update = (id: number, payload: NewEmployee) =>
    execute(async () => {
      const updated = await employeesApi.update(id, payload)
      items.value = items.value.map((e) => (e.id === id ? updated : e))
      return updated
    }, 'Unable to update employee', 'Employee updated successfully.')

  const remove = (id: number) =>
    execute(async () => {
      await employeesApi.remove(id)
      items.value = items.value.filter((e) => e.id !== id)
    })

  return { items, loading, error, msg, fetchAll, fetchOne, create, update, remove }
})
