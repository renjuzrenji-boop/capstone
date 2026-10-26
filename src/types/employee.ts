export type EmployeeStatus = 'active' | 'inactive'

export interface NewEmployee {
  name: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  status: EmployeeStatus
  skills: string[]
  primarySkill: string
  workExperience: string
  techStack: string[],
  currentProject: {
    name: string
    role: string
    duration: string
  },
  previousProjects: string[],
  completedTraning: string[],
  TrainingStatus: string
}

export interface Employee extends NewEmployee {
  id: number
}
