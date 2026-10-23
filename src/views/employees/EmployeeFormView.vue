<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeesStore } from '@/stores/employees'
import type { NewEmployee } from '@/types/employee'

const route = useRoute()
const router = useRouter()
const store = useEmployeesStore()

const id = computed(() => (route.params.id ? String(route.params.id) : null))
const isEdit = computed(() => !!id.value)

const form = reactive<NewEmployee>({
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  status: 'active',
})
const errors = ref<Partial<Record<keyof NewEmployee, string>>>({})

onMounted(async () => {
  if (!id.value) return
  try {
    const { id: _id, ...data } = await store.fetchOne(id.value)
    Object.assign(form, data)
  } catch {
    /* error shown from store */
  }
})

function validate() {
  const e: typeof errors.value = {}
  if (!form.name.trim()) e.name = 'Name is required'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
  if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
  if (!form.department.trim()) e.department = 'Department is required'
  if (!form.designation.trim()) e.designation = 'Designation is required'
  if (!form.joiningDate) e.joiningDate = 'Joining date is required'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  const payload = { ...form, name: form.name.trim(), email: form.email.trim() }
  try {
    if (id.value) await store.update(id.value, payload)
    else await store.create(payload)
    router.push('/app/employees')
  } catch {
    /* error shown from store */
  }
}

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
        <input v-model="form.joiningDate" type="date" :class="input" />
        <span v-if="errors.joiningDate" class="text-sm text-red-600">{{ errors.joiningDate }}</span>
      </label>
      <label class="block">Status
        <select v-model="form.status" :class="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="store.loading" class="rounded bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {{ isEdit ? 'Save changes' : 'Add employee' }}
        </button>
        <RouterLink to="/app/employees" class="rounded border px-5 py-2">Cancel</RouterLink>
      </div>
    </form>
  </main>
</template>
