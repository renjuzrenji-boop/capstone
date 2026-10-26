<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import type { Employee } from '@/types/employee'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useEmployeesStore()
const id = Number(route.params.id)

const employee = ref<Employee | null>(null)
const confirming = ref(false)

onMounted(async () => {
  try {
    employee.value = await store.fetchOne(id)
  } catch {
    /* error shown from store */
  }
})

async function remove() {
  try {
    await store.remove(id)
    router.push('/app/employees')
  } catch {
    confirming.value = false
  }
}

const fields = (e: Employee): [string, string][] => [
  ['Email', e.email],
  ['Phone', e.phone || '—'],
  ['Department', e.department],
  ['Designation', e.designation],
  ['Skills', e.skills?.join(', ') || '—'],
  ['Primary skill', e.primarySkill || '—'],
  ['Work experience', e.workExperience || '—'],
  ['Tech stack', e.techStack?.join(', ') || '—'],
  ['Joining date', e.joiningDate || '—'],
  ['Status', e.status],
]
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <RouterLink to="/app/employees" class="text-sm text-teal-700 hover:underline">&larr; Employees</RouterLink>
    <p v-if="store.error" class="my-4 rounded bg-red-50 p-3 text-red-700" role="alert">{{ store.error }}</p>
    <p v-else-if="!employee" class="mt-4 text-gray-500">Loading...</p>

    <section v-if="employee" class="mt-2">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-bold">{{ employee.name }}</h1>
        <div v-if="auth.can('employees:write')" class="flex gap-3">
          <RouterLink :to="`/app/employees/${id}/edit`" class="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">Edit</RouterLink>
          <button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" @click="confirming = true">Delete</button>
        </div>
      </div>

      
      <dl class="divide-y divide-gray-100 rounded border border-gray-200">
        <div v-for="[label, value] in fields(employee)" :key="label" class="grid grid-cols-3 gap-4 px-4 py-3">
          <dt class="text-sm text-gray-500">{{ label }}</dt>
          <dd class="col-span-2">{{ value }}</dd>
        </div>
      </dl>

      <div class="mt-6 bg-gray-100 p-4 rounded">
        <h1 class="text-3xl font-bold">Projects Details</h1>
        <div class="mt-4">
          <h3 class="font-semibold">Current Project</h3>
          <p>Name: {{ employee.currentProject.name || '—' }}</p>
          <p>Role: {{ employee.currentProject.role || '—' }}</p>
          <p>Duration: {{ employee.currentProject.duration || '—' }}</p>
        </div>
        <div class="mt-4">
          <h3 class="font-semibold">Previous Projects</h3>
          <ul>
            <li v-for="(project, index) in employee.previousProjects" :key="index">{{ project }}</li>
            <li v-if="!employee.previousProjects.length">—</li>
          </ul>
        </div>
      </div>

      <div class="mt-6 bg-gray-100 p-4 rounded">
        <h1 class="text-3xl font-bold">Training Details</h1>
        <div class="mt-4">
          <h3 class="font-semibold">Completed Training</h3>
          <ul>
            <li v-for="(training, index) in employee.completedTraning" :key="index">{{ training }}</li>
            <li v-if="!employee.completedTraning.length">—</li>
          </ul>
        </div>
        <div class="mt-4">
          <h3 class="font-semibold">Training Status</h3>
          <p>{{ employee.TrainingStatus || '—' }}</p>
        </div>
      </div>
    </section>

    <div v-if="confirming" class="fixed inset-0 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div class="w-full max-w-sm rounded bg-white p-6 shadow-lg">
        <h2 class="mb-2 text-lg font-semibold">Delete employee?</h2>
        <p class="mb-4 text-gray-600">This cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button class="rounded border px-4 py-2" @click="confirming = false">Cancel</button>
          <button class="rounded bg-red-600 px-4 py-2 text-white" :disabled="store.loading" @click="remove">Delete</button>
        </div>
      </div>
    </div>
  </main>
</template>
