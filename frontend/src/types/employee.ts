export interface Employee {
  id: number;
  name: string;
  admission_date: string;
  rg: string;
  cpf: string;
  birth_date: string;
  role: string | null;
}

export type EmployeeInput = Omit<Employee, "id">;

export interface EmployeeListParams {
  skip?: number;
  limit?: number;
}
