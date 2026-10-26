<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import type { Employee } from '@/types/employee'

const auth = useAuthStore()
const store = useEmployeesStore()
const search = ref('')
const status = ref<'all' | 'active' | 'inactive'>('all')
const skills = ref<'all' | 'java' | 'python' | 'javascript'>('all')
const experience = ref<'all' | '0-1' | '1-3' | '3-5' | '5+'>('all')
const project = ref('all')
const deleting = ref<Employee | null>(null)

onMounted(() => store.fetchAll().catch(() => {}))

const convertToMonths = (experience: string | undefined) => {
  const value = parseFloat(experience ?? '')
  if (Number.isNaN(value)) return null

  // A bare number such as "2" is treated as years
  return (experience ?? '').toLowerCase().includes('month') ? value : value * 12
}

const EXPERIENCE_RANGES: Record<string, [number, number]> = {
  '0-1': [0, 12],
  '1-3': [12, 36],
  '3-5': [36, 60],
  '5+': [60, Infinity],
}

const matchesExperience = (workExperience: string | undefined, selectedRange: string) => {
  const months = convertToMonths(workExperience)
  const range = EXPERIENCE_RANGES[selectedRange]

  return months !== null && !!range && months >= range[0] && months < range[1]
}

const projectsOf = (e: Employee) =>
  [e.currentProject?.name, ...(e.previousProjects ?? [])].filter((n): n is string => !!n?.trim())

const projectOptions = computed(() =>
  [...new Set(store.items.flatMap(projectsOf))].sort((a, b) => a.localeCompare(b)),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.items.filter((e) => {
    const match =
      (status.value === 'all' || e.status === status.value) &&
      (skills.value === 'all' || (e.skills ?? []).some((s) => s.toLowerCase() === skills.value))  && (experience.value === 'all' || matchesExperience(e.workExperience, experience.value))&&
      (project.value === 'all' || projectsOf(e).includes(project.value)) &&
      (!q || [e.name, e.email, e.department, e.designation].some((v) => v.toLowerCase().includes(q)))
    console.log('filter employee:', e.name,e.skills, { status: status.value, skills: skills.value, q, match, experience: experience.value, project: project.value, original:e.workExperience })
    return match
  })
})
function clearFilter() {
  search.value = ''
  status.value = 'all'
  skills.value = 'all'
  experience.value = 'all'
  project.value = 'all'
}

async function confirmDelete() {
  if (!deleting.value) return
  try {
    await store.remove(deleting.value.id)
  } catch {
    /* error shown from store */
  }
  deleting.value = null
}
</script>

<template>
  <main class="mx-auto max-w-6xl p-6">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <RouterLink to="/app/dashboard" class="text-sm text-teal-700 hover:underline">&larr; Dashboard</RouterLink>
        <h1 class="text-3xl font-bold">Employees</h1>
      </div>
      <RouterLink
        v-if="auth.can('employees:write')"
        to="/app/employees/new"
        class="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
      >
        + Add Employee
      </RouterLink>
    </header>

    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="search"
        type="search"
        placeholder="Search name..."
        class="min-w-64 flex-1 rounded border border-gray-300 px-3 py-2"
      />
      <select v-model="status" class="rounded border border-gray-300 px-3 py-2">
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="skills" class="rounded border border-gray-300 px-3 py-2">
        <option value="all">All Skills</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>
      <select v-model="experience" class="rounded border border-gray-300 px-3 py-2">
        <option value="all">All Experience</option>
        <option value="0-1">0-1 years</option>
        <option value="1-3">1-3 years</option>
        <option value="3-5">3-5 years</option>
        <option value="5+">5+ years</option>
      </select>
       <select v-model="project" class="rounded border border-gray-300 px-3 py-2">
        <option value="all">All Projects</option>
        <option v-for="p in projectOptions" :key="p" :value="p">{{ p }}</option>
      </select>
      <button class="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300" @click="clearFilter"> Clear Filter</button>
    </div>

    <p v-if="store.error" class="mb-4 rounded bg-red-50 p-3 text-red-700" role="alert">{{ store.error }}</p>
    <p v-if="store.loading && !store.items.length" class="text-gray-500">Loading...</p>

    <div v-else class="overflow-x-auto rounded border border-gray-200">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Department</th>
            <th class="px-4 py-3">Designation</th>
            <th class="px-4 py-3">Skills</th>
            <th class="px-4 py-3">Work Experience</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered" :key="e.id" class="border-t border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">
              <RouterLink :to="`/app/employees/${e.id}`" class="text-teal-700 hover:underline">{{ e.name }}</RouterLink>
            </td>
            <td class="px-4 py-3">{{ e.email }}</td>
            <td class="px-4 py-3">{{ e.department }}</td>
            <td class="px-4 py-3">{{ e.designation }}</td>
            <td class="px-4 py-3">{{ (e.skills ?? []).join(', ') }}</td>
            <td class="px-4 py-3">{{ e.workExperience }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="e.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'"
              >
                {{ e.status }}
              </span>
            </td>
            <td class="space-x-3 px-4 py-3 text-right">
              <RouterLink :to="`/app/employees/${e.id}`" class="text-teal-700 hover:underline">View</RouterLink>
              <template v-if="auth.can('employees:write')">
                <RouterLink :to="`/app/employees/${e.id}/edit`" class="text-blue-700 hover:underline">Edit</RouterLink>
                <button class="text-red-700 hover:underline" @click="deleting = e">Delete</button>
              </template>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">No employees found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="deleting" class="fixed inset-0 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div class="w-full max-w-sm rounded bg-white p-6 shadow-lg">
        <h2 class="mb-2 text-lg font-semibold">Delete employee?</h2>
        <p class="mb-4 text-gray-600">
          <strong>{{ deleting.name }}</strong> will be permanently removed.
        </p>
        <div class="flex justify-end gap-3">
          <button class="rounded border px-4 py-2" @click="deleting = null">Cancel</button>
          <button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" :disabled="store.loading" @click="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
