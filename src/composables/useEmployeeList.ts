import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useEmployeeFilters } from './useEmployeeFilters'
import type { Employee } from '@/types/employee'

const PAGE_SIZE = 10

export function useEmployeeList() {
  const auth = useAuthStore()
  const store = useEmployeesStore()
  const canWrite = computed(() => auth.can('employees:write'))
  const {
    search,
    status,
    skills,
    experience,
    project,
    projectOptions,
    filtered,
    clearFilters,
  } = useEmployeeFilters(() => store.items)
  const deleting = ref<Employee | null>(null)
  const currentPage = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
  const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filtered.value.slice(start, start + PAGE_SIZE)
  })
  const firstVisible = computed(() =>
    filtered.value.length ? (currentPage.value - 1) * PAGE_SIZE + 1 : 0,
  )
  const lastVisible = computed(() => Math.min(currentPage.value * PAGE_SIZE, filtered.value.length))

  watch([search, status, skills, experience, project], () => {
    currentPage.value = 1
  })

  watch(pageCount, (count) => {
    if (currentPage.value > count) currentPage.value = count
  })

  onMounted(() => store.fetchAll().catch(() => {}))

  function requestDelete(employee: Employee) {
    deleting.value = employee
  }

  function cancelDelete() {
    deleting.value = null
  }

  async function confirmDelete() {
    if (!deleting.value) return

    try {
      await store.remove(deleting.value.id)
    } catch {
      // The store exposes the error for the view to display.
    } finally {
      deleting.value = null
    }
  }

  return {
    store,
    canWrite,
    search,
    status,
    skills,
    experience,
    project,
    projectOptions,
    filtered,
    clearFilters,
    deleting,
    currentPage,
    pageCount,
    paginatedEmployees,
    firstVisible,
    lastVisible,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
