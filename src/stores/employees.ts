import { ref } from 'vue'
import { defineStore } from 'pinia'
import { employeesApi } from '@/api/employees'
import { errorMessage } from '@/api/http'
import type { Employee, NewEmployee } from '@/types/employee'

export const useEmployeesStore = defineStore('employees', () => {
  const items = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = errorMessage(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchAll = () => run(async () => { items.value = await employeesApi.list() })
  const fetchOne = (id: number) => run(() => employeesApi.get(id))

  const create = (payload: NewEmployee) =>
    run(async () => {
      const created = await employeesApi.create(payload)
      items.value.push(created)
      return created
    })

  const update = (id: number, payload: NewEmployee) =>
    run(async () => {
      const updated = await employeesApi.update(id, payload)
      items.value = items.value.map((e) => (e.id === id ? updated : e))
      return updated
    })

  const remove = (id: number) =>
    run(async () => {
      await employeesApi.remove(id)
      items.value = items.value.filter((e) => e.id !== id)
    })

  return { items, loading, error, fetchAll, fetchOne, create, update, remove }
})
