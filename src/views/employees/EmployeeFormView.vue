<script setup lang="ts">
import { useEmployeeForm } from '@/composables/useEmployeeForm'

const {
  store,
  id,
  isEdit,
  form,
  minDate,
  errors,
  skillsText,
  techStackText,
  previousProjectsText,
  completedTrainingText,
  submit,
} = useEmployeeForm()

const input = 'mt-1 w-full rounded border border-gray-300 px-3 py-2'
</script>

<template>
  <main class="mx-auto max-w-xl p-6">
    <RouterLink to="/app/employees" class="text-sm text-teal-700 hover:underline">&larr; Employees</RouterLink>
    <h1 class="mb-6 text-3xl font-bold">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h1>

    <p v-if="store.error" class="mb-4 rounded bg-red-50 p-3 text-red-700" role="alert">{{ store.error }}</p>

    <form class="space-y-4" novalidate @submit.prevent="submit">
      <label class="block">Name *
        <input v-model="form.name" :class="input" />
        <span v-if="errors.name" class="text-sm text-red-600">{{ errors.name }}</span>
      </label>
      <label class="block">Email *
        <input v-model="form.email" type="email" :class="input" />
        <span v-if="errors.email" class="text-sm text-red-600">{{ errors.email }}</span>
      </label>
      <label class="block">Phone
        <input v-model="form.phone" type="tel" :class="input" />
        <span v-if="errors.phone" class="text-sm text-red-600">{{ errors.phone }}</span>
      </label>
      <label class="block">Department *
        <input v-model="form.department" :class="input" />
        <span v-if="errors.department" class="text-sm text-red-600">{{ errors.department }}</span>
      </label>
      <label class="block">Designation *
        <input v-model="form.designation" :class="input" />
        <span v-if="errors.designation" class="text-sm text-red-600">{{ errors.designation }}</span>
      </label>
      
      <label class="block">Joining date *
        <input v-model="form.joiningDate" type="date" :min="minDate" :class="input" />
        <span v-if="errors.joiningDate" class="text-sm text-red-600">{{ errors.joiningDate }}</span>
      </label>
      <label class="block">Status
        <select v-model="form.status" :class="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Skills & Experience</h2>
        <label class="block">Skills (comma separated)
        <input v-model.lazy="skillsText" placeholder="Java, HTML" :class="input" />
      </label>
      <label class="block">Primary skill
        <input v-model="form.primarySkill" :class="input" />
      </label>
      <label class="block">Work experience
        <input v-model="form.workExperience" placeholder="3 years" :class="input" />
      </label>
      <label class="block">Tech stack (comma separated)
        <input v-model.lazy="techStackText" placeholder="Java, HTML" :class="input" />
      </label>
      </div>

       <div class="space-y-4">
        <h2 class="text-xl font-semibold">Project Details</h2>
      <label class="block">Current Project Name
        <input v-model="form.currentProject.name" placeholder="Project Alpha" :class="input" />
      </label>
      <label class="block">Current Project Role
        <input v-model="form.currentProject.role" placeholder="Developer" :class="input" />
      </label>
      <label class="block">Current Project Duration
        <input v-model="form.currentProject.duration" placeholder="6 months" :class="input" />
      </label>
      <label class="block">Previous Projects (comma separated)
        <input v-model.lazy="previousProjectsText" placeholder="Project Beta, Project Gamma" :class="input" />
      </label>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Training Details</h2>
      <label class="block">Completed Training (comma separated)
        <input v-model.lazy="completedTrainingText" placeholder="Training A, Training B" :class="input" />
      </label>
      <label class="block">Training Status
        <input v-model="form.TrainingStatus" placeholder="Completed" :class="input" />
      </label>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="store.loading" class="rounded bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {{ isEdit ? 'Edit employee' : 'Add employee' }}
        </button>
        <RouterLink to="/app/employees" class="rounded border px-5 py-2">Cancel</RouterLink>
      </div>
    </form>
  </main>
</template>
