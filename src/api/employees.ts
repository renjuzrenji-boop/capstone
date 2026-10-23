import http from './http'
import type { Employee, NewEmployee } from '@/types/employee'

export const employeesApi = {
  list: () => http.get<Employee[]>('/employees').then((r) => r.data),
  get: (id: string) => http.get<Employee>(`/employees/${id}`).then((r) => r.data),
  create: (payload: NewEmployee) => http.post<Employee>('/employees', payload).then((r) => r.data),
  update: (id: string, payload: NewEmployee) =>
    http.put<Employee>(`/employees/${id}`, payload).then((r) => r.data),
  remove: (id: string) => http.delete(`/employees/${id}`).then(() => undefined),
}
