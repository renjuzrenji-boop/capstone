import { describe, expect, it } from 'vitest'
import { useEmployeeFilters } from '@/composables/useEmployeeFilters'
import type { Employee } from '@/types/employee'

const make = (overrides: Partial<Employee>): Employee => ({
  id: 1,
  name: 'Anita Sharma',
  email: 'anita@company.com',
  phone: '',
  department: 'Engineering',
  designation: 'Developer',
  joiningDate: '2024-01-01',
  status: 'active',
  skills: ['Java'],
  primarySkill: 'Java',
  workExperience: '3 years',
  techStack: [],
  currentProject: { name: 'Alpha', role: '', duration: '' },
  previousProjects: ['Beta'],
  completedTraning: [],
  TrainingStatus: '',
  ...overrides,
})

const employees = [
  make({ id: 1 }),
  make({ id: 2, name: 'Rahul Verma', email: 'rahul@company.com', status: 'inactive', skills: ['Python'], workExperience: '6 months', currentProject: { name: 'Gamma', role: '', duration: '' }, previousProjects: [] }),
  make({ id: 3, name: 'Sneha Pillai', skills: ['JavaScript'], workExperience: '7 years' }),
]

describe('useEmployeeFilters', () => {
  it('returns everyone by default', () => {
    const { filtered } = useEmployeeFilters(employees)
    expect(filtered.value).toHaveLength(3)
  })

  it('searches by name case-insensitively', () => {
    const { search, filtered } = useEmployeeFilters(employees)
    search.value = 'RAHUL'
    expect(filtered.value.map((e) => e.id)).toEqual([2])
  })

  it('filters by status and skill', () => {
    const { status, skills, filtered } = useEmployeeFilters(employees)
    status.value = 'inactive'
    expect(filtered.value.map((e) => e.id)).toEqual([2])
    status.value = 'all'
    skills.value = 'javascript'
    expect(filtered.value.map((e) => e.id)).toEqual([3])
  })

  it('filters by experience range, treating months and years correctly', () => {
    const { experience, filtered } = useEmployeeFilters(employees)
    experience.value = '0-1'
    expect(filtered.value.map((e) => e.id)).toEqual([2])
    experience.value = '5+'
    expect(filtered.value.map((e) => e.id)).toEqual([3])
  })

  it('filters by project and lists sorted unique project options', () => {
    const { project, projectOptions, filtered } = useEmployeeFilters(employees)
    expect(projectOptions.value).toEqual(['Alpha', 'Beta', 'Gamma'])
    project.value = 'Gamma'
    expect(filtered.value.map((e) => e.id)).toEqual([2])
  })

  it('clears all filters', () => {
    const { search, status, clearFilters, filtered } = useEmployeeFilters(employees)
    search.value = 'zzz'
    status.value = 'inactive'
    expect(filtered.value).toHaveLength(0)
    clearFilters()
    expect(filtered.value).toHaveLength(3)
  })
})
