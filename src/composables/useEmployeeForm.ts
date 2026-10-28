import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeesStore } from '@/stores/employees'
import type { NewEmployee } from '@/types/employee'

function createEmptyForm(): NewEmployee {
  return {
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    skills: [],
    primarySkill: '',
    workExperience: '',
    techStack: [],
    currentProject: {
      name: '',
      role: '',
      duration: '',
    },
    previousProjects: [],
    completedTraning: [],
    TrainingStatus: '',
  }
}

const toList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)

export function useEmployeeForm() {
  const route = useRoute()
  const router = useRouter()
  const store = useEmployeesStore()

  const id = computed(() => (route.params.id ? Number(route.params.id) : null))
  const isEdit = computed(() => !!id.value)
  const form = reactive<NewEmployee>(createEmptyForm())
  const today = form.joiningDate
  const originalDate = ref<string | null>(null)
  const minDate = computed(() =>
    originalDate.value && originalDate.value < today ? originalDate.value : today,
  )
  const errors = ref<Partial<Record<keyof NewEmployee, string>>>({})

  const skillsText = computed({
    get: () => form.skills.join(', '),
    set: (value: string) => (form.skills = toList(value)),
  })
  const techStackText = computed({
    get: () => form.techStack.join(', '),
    set: (value: string) => (form.techStack = toList(value)),
  })
  const previousProjectsText = computed({
    get: () => form.previousProjects.join(', '),
    set: (value: string) => (form.previousProjects = toList(value)),
  })
  const completedTrainingText = computed({
    get: () => form.completedTraning.join(', '),
    set: (value: string) => (form.completedTraning = toList(value)),
  })

  onMounted(async () => {
    if (!id.value) return

    try {
      const { id: _id, ...data } = await store.fetchOne(id.value)
      Object.assign(form, data, {
        skills: data.skills ?? [],
        techStack: data.techStack ?? [],
        previousProjects: data.previousProjects ?? [],
        currentProject: { ...data.currentProject },
      })
      originalDate.value = data.joiningDate
    } catch {
      // The store exposes the error for the view to display.
    }
  })

  function validate() {
    const validationErrors: typeof errors.value = {}
    if (!form.name.trim()) validationErrors.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) validationErrors.email = 'Enter a valid email'
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone)) {
      validationErrors.phone = 'Enter a valid phone number'
    }
    if (!form.department.trim()) validationErrors.department = 'Department is required'
    if (!form.designation.trim()) validationErrors.designation = 'Designation is required'
    if (!form.joiningDate) validationErrors.joiningDate = 'Joining date is required'
    else if (form.joiningDate < minDate.value) {
      validationErrors.joiningDate = 'Past dates are not allowed'
    }

    errors.value = validationErrors
    return Object.keys(validationErrors).length === 0
  }

  async function submit() {
    if (!validate()) return

    const payload = { ...form, name: form.name.trim(), email: form.email.trim() }
    try {
      if (id.value) await store.update(id.value, payload)
      else await store.create(payload)
      router.push('/app/employees')
    } catch {
      // The store exposes the error for the view to display.
    }
  }

  return {
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
  }
}
