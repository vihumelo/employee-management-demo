import { describe, expect, it } from "vitest";
import { formatEmployeeCpf, formatEmployeeDate } from "./employeeFormatters";

describe("employee formatters", () => {
  it("formats an ISO date for display", () => {
    expect(formatEmployeeDate("2024-01-10")).toBe("10/01/2024");
  });

  it("formats an 11-digit CPF", () => {
    expect(formatEmployeeCpf("12345678901")).toBe("123.456.789-01");
  });

  it("preserves a CPF when it does not have 11 digits", () => {
    expect(formatEmployeeCpf("12345")).toBe("12345");
  });
});
