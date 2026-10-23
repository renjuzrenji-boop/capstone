export type EmployeeStatus = 'active' | 'inactive'

export interface NewEmployee {
  name: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  status: EmployeeStatus
}

export interface Employee extends NewEmployee {
  id: string
}
