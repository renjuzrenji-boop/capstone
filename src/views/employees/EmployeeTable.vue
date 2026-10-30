<script setup lang="ts">
import type { Employee } from '@/types/employee'

defineProps<{
  employees: readonly Employee[]
  canWrite: boolean
}>()

const emit = defineEmits<{
  delete: [employee: Employee]
}>()
</script>

<template>
  <div class="overflow-x-auto rounded border border-gray-200">
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
        <tr
          v-for="employee in employees"
          :key="employee.id"
          v-memo="[employee, canWrite]"
          class="border-t border-gray-100 hover:bg-gray-50"
        >
          <td class="px-4 py-3 font-medium">
            <RouterLink :to="`/app/employees/${employee.id}`" class="text-teal-700 hover:underline">
              {{ employee.name }}
            </RouterLink>
          </td>
          <td class="px-4 py-3">{{ employee.email }}</td>
          <td class="px-4 py-3">{{ employee.department }}</td>
          <td class="px-4 py-3">{{ employee.designation }}</td>
          <td class="px-4 py-3">{{ (employee.skills ?? []).join(', ') }}</td>
          <td class="px-4 py-3">{{ employee.workExperience }}</td>
          <td class="px-4 py-3">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'"
            >
              {{ employee.status }}
            </span>
          </td>
          <td class="space-x-3 px-4 py-3 text-right">
            <RouterLink :to="`/app/employees/${employee.id}`" class="text-teal-700 hover:underline">View</RouterLink>
            <template v-if="canWrite">
              <RouterLink :to="`/app/employees/${employee.id}/edit`" class="text-blue-700 hover:underline">Edit</RouterLink>
              <button class="text-red-700 hover:underline" @click="emit('delete', employee)">Delete</button>
            </template>
          </td>
        </tr>
        <tr v-if="!employees.length">
          <td colspan="8" class="px-4 py-8 text-center text-gray-500">No employees found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
