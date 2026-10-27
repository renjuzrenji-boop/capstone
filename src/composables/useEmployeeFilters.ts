import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { Employee, EmployeeStatus } from '@/types/employee'

type StatusFilter = 'all' | EmployeeStatus
type SkillsFilter = 'all' | 'java' | 'python' | 'javascript'
type ExperienceFilter = 'all' | '0-1' | '1-3' | '3-5' | '5+'

const EXPERIENCE_RANGES: Record<Exclude<ExperienceFilter, 'all'>, [number, number]> = {
  '0-1': [0, 12],
  '1-3': [12, 36],
  '3-5': [36, 60],
  '5+': [60, Infinity],
}

function convertToMonths(experience: string | undefined) {
  const value = Number.parseFloat(experience ?? '')
  if (Number.isNaN(value)) return null

  return (experience ?? '').toLowerCase().includes('month') ? value : value * 12
}

function matchesExperience(workExperience: string | undefined, selectedRange: ExperienceFilter) {
  if (selectedRange === 'all') return true

  const months = convertToMonths(workExperience)
  const [minimum, maximum] = EXPERIENCE_RANGES[selectedRange]
  return months !== null && months >= minimum && months < maximum
}

function projectsOf(employee: Employee) {
  return [employee.currentProject?.name, ...(employee.previousProjects ?? [])]
    .filter((name): name is string => !!name?.trim())
}

export function useEmployeeFilters(employees: MaybeRefOrGetter<readonly Employee[]>) {
  const search = ref('')
  const status = ref<StatusFilter>('all')
  const skills = ref<SkillsFilter>('all')
  const experience = ref<ExperienceFilter>('all')
  const project = ref('all')

  const projectOptions = computed(() =>
    [...new Set(toValue(employees).flatMap(projectsOf))].sort((a, b) => a.localeCompare(b)),
  )

  const filtered = computed(() => {
    const query = search.value.trim().toLowerCase()

    return toValue(employees).filter((employee) =>
      (status.value === 'all' || employee.status === status.value) &&
      (skills.value === 'all' || (employee.skills ?? []).some((skill) => skill.toLowerCase() === skills.value)) &&
      matchesExperience(employee.workExperience, experience.value) &&
      (project.value === 'all' || projectsOf(employee).includes(project.value)) &&
      (!query || [employee.name, employee.email, employee.department, employee.designation]
        .some((value) => value.toLowerCase().includes(query))),
    )
  })

  function clearFilters() {
    search.value = ''
    status.value = 'all'
    skills.value = 'all'
    experience.value = 'all'
    project.value = 'all'
  }

  return { search, status, skills, experience, project, projectOptions, filtered, clearFilters }
}
