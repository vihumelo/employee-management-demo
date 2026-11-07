import { AxiosHeaders, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";
import { employeeService } from "./employeeService";
import type { Employee } from "../types/employee";

const makeEmployee = (id: number): Employee => ({
  id,
  name: `Employee ${id}`,
  admission_date: "2024-01-10",
  rg: "123456789",
  cpf: "12345678901",
  birth_date: "1990-05-20",
  role: "Engineer",
});

const makeResponse = (data: Employee[]): AxiosResponse<Employee[]> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});

describe("employee service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches employee records in API-sized batches until the final page", async () => {
    const firstBatch = Array.from({ length: 1000 }, (_, index) => makeEmployee(index + 1));
    const finalBatch = [makeEmployee(1001), makeEmployee(1002)];
    const get = vi.spyOn(apiClient, "get");
    get
      .mockResolvedValueOnce(makeResponse(firstBatch))
      .mockResolvedValueOnce(makeResponse(finalBatch));

    const employees = await employeeService.listAll();

    expect(employees).toHaveLength(1002);
    expect(employees[employees.length - 1]?.id).toBe(1002);
    expect(get).toHaveBeenNthCalledWith(1, "/employees", {
      params: { skip: 0, limit: 1000 },
      signal: undefined,
    });
    expect(get).toHaveBeenNthCalledWith(2, "/employees", {
      params: { skip: 1000, limit: 1000 },
      signal: undefined,
    });
  });
});
