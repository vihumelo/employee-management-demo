import { apiClient } from "./apiClient";
import type {
  Employee,
  EmployeeInput,
  EmployeeListParams,
} from "../types/employee";

const EMPLOYEE_PAGE_SIZE = 1000;

async function listEmployees(
  params: EmployeeListParams = {},
  signal?: AbortSignal,
): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>("/employees", {
    params,
    signal,
  });

  return response.data;
}

export const employeeService = {
  list: listEmployees,

  async listAll(signal?: AbortSignal): Promise<Employee[]> {
    const employees: Employee[] = [];
    let skip = 0;
    let page: Employee[] = [];

    do {
      page = await listEmployees(
        { skip, limit: EMPLOYEE_PAGE_SIZE },
        signal,
      );
      employees.push(...page);
      skip += page.length;
    } while (page.length === EMPLOYEE_PAGE_SIZE);

    return employees;
  },

  async getById(employeeId: number, signal?: AbortSignal): Promise<Employee> {
    const response = await apiClient.get<Employee>(`/employees/${employeeId}`, {
      signal,
    });

    return response.data;
  },

  async create(employee: EmployeeInput): Promise<Employee> {
    const response = await apiClient.post<Employee>("/employees", employee);
    return response.data;
  },

  async update(
    employeeId: number,
    employee: EmployeeInput
  ): Promise<Employee> {
    const response = await apiClient.put<Employee>(
      `/employees/${employeeId}`,
      employee
    );

    return response.data;
  },

  async delete(employeeId: number): Promise<void> {
    await apiClient.delete(`/employees/${employeeId}`);
  },
};
