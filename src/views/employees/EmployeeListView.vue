<script setup lang="ts">
import { useEmployeeList } from '@/composables/useEmployeeList'
import EmployeeTable from './EmployeeTable.vue'

const {
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
} = useEmployeeList()
</script>

<template>
  <main class="mx-auto max-w-6xl p-6">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <RouterLink to="/app/dashboard" class="text-sm text-teal-700 hover:underline">&larr; Dashboard</RouterLink>
        <h1 class="text-3xl font-bold">Employees</h1>
      </div>
      <RouterLink
        v-if="canWrite"
        to="/app/employees/new"
        class="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
      >
        + Add Employee
      </RouterLink>
    </header>

    <p v-if="store.msg" class="mb-4 rounded bg-green-50 p-3 text-green-700" role="status">
      {{ store.msg }}
    </p>
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
      <button class="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300" @click="clearFilters"> Clear Filter</button>
    </div>

    <p v-if="store.error" class="mb-4 rounded bg-red-50 p-3 text-red-700" role="alert">{{ store.error }}</p>
    <p v-if="store.loading && !store.items.length" class="text-gray-500">Loading...</p>

    <EmployeeTable
      v-else
      :employees="paginatedEmployees"
      :can-write="canWrite"
      @delete="requestDelete"
    />

    <nav
      v-if="filtered.length"
      class="mt-4 flex flex-wrap items-center justify-between gap-3"
      aria-label="Employee list pagination"
    >
      <p class="text-sm text-gray-600" aria-live="polite">
        Showing {{ firstVisible }}–{{ lastVisible }} of {{ filtered.length }} employees
      </p>
      <div v-if="pageCount > 1" class="flex items-center gap-2">
        <button
          type="button"
          class="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          class="min-w-10 rounded border px-3 py-2 text-sm"
          :class="currentPage === page ? 'border-teal-700 bg-teal-700 text-white' : 'hover:bg-gray-100'"
          :aria-label="`Page ${page}`"
          :aria-current="currentPage === page ? 'page' : undefined"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === pageCount"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </nav>

    <div v-if="deleting" class="fixed inset-0 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div class="w-full max-w-sm rounded bg-white p-6 shadow-lg">
        <h2 class="mb-2 text-lg font-semibold">Delete employee?</h2>
        <p class="mb-4 text-gray-600">
          <strong>{{ deleting.name }}</strong> will be permanently removed.
        </p>
        <div class="flex justify-end gap-3">
          <button class="rounded border px-4 py-2" @click="cancelDelete">Cancel</button>
          <button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" :disabled="store.loading" @click="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
