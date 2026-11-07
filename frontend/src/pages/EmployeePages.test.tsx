import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../app/App";
import { employeeService } from "../services/employeeService";
import { ApiError } from "../services/apiError";
import type { Employee, EmployeeInput } from "../types/employee";

vi.mock("../services/employeeService", () => ({
  employeeService: {
    list: vi.fn(),
    listAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const createEmployee = (id: number, name = `Employee ${id}`): Employee => ({
  id,
  name,
  admission_date: "2024-01-10",
  rg: "123456789",
  cpf: "12345678901",
  birth_date: "1990-05-20",
  role: "Engineer",
});

const renderAppAt = (path: string) => {
  window.history.replaceState({}, "", path);
  return render(<App />);
};

const fillEmployeeForm = async (user: UserEvent) => {
  await user.type(screen.getByRole("textbox", { name: "Name" }), "New Employee");
  await user.type(screen.getByRole("textbox", { name: "CPF" }), "12345678901");
  await user.type(screen.getByRole("textbox", { name: "RG" }), "987654321");
  fireEvent.change(screen.getByLabelText("Birth Date"), {
    target: { value: "1990-05-20" },
  });
  fireEvent.change(screen.getByLabelText("Admission Date"), {
    target: { value: "2024-01-10" },
  });
};

describe("employee pages", () => {
  beforeEach(() => {
    vi.mocked(employeeService.list).mockReset();
    vi.mocked(employeeService.listAll).mockReset().mockResolvedValue([]);
    vi.mocked(employeeService.getById).mockReset();
    vi.mocked(employeeService.create).mockReset();
    vi.mocked(employeeService.update).mockReset();
    vi.mocked(employeeService.delete).mockReset();
    window.history.replaceState({}, "", "/");
  });

  it("shows loading feedback while employees are being fetched", () => {
    vi.mocked(employeeService.listAll).mockReturnValue(new Promise(() => undefined));

    renderAppAt("/");

    expect(screen.getByRole("status")).toHaveTextContent("Loading employees");
  });

  it("supports client-side search and pagination", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.listAll).mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => createEmployee(index + 1)),
    );

    renderAppAt("/");

    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(9);
    expect(within(table).queryByRole("cell", { name: "Employee 9" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(within(table).getByRole("cell", { name: "Employee 9" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Search employees" }), "Employee 2");
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Showing 1–1 of 1 employees")).toBeInTheDocument();
  });

  it("paginates through employees beyond the first 100 results", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.listAll).mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => createEmployee(index + 1)),
    );

    renderAppAt("/");
    const table = await screen.findByRole("table");

    for (let page = 1; page < 13; page += 1) {
      await user.click(screen.getByRole("button", { name: "Next page" }));
    }

    expect(within(table).getByRole("cell", { name: "Employee 101" })).toBeInTheDocument();
    expect(screen.getByText("Showing 97–101 of 101 employees")).toBeInTheDocument();
  });

  it("offers retry after a list request fails", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.listAll)
      .mockRejectedValueOnce(new ApiError("Unable to connect to the server. Please try again.", null))
      .mockResolvedValueOnce([]);

    renderAppAt("/");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to connect to the server. Please try again.",
    );
    await user.click(screen.getByRole("button", { name: "Try Again" }));
    expect(await screen.findByRole("heading", { name: "No employees yet" })).toBeInTheDocument();
    expect(employeeService.listAll).toHaveBeenCalledTimes(2);
  });

  it("deletes an employee from the row actions menu", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.listAll).mockResolvedValue([createEmployee(3, "Ana Silva")]);
    vi.mocked(employeeService.delete).mockResolvedValue(undefined);

    renderAppAt("/");
    const table = await screen.findByRole("table");
    await user.click(
      within(table).getByRole("button", { name: "Open actions for Ana Silva" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    await waitFor(() => {
      expect(employeeService.delete).toHaveBeenCalledWith(3);
      expect(screen.getByRole("heading", { name: "No employees yet" })).toBeInTheDocument();
    });
  });

  it("keeps the list visible and retries a failed employee deletion", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.listAll).mockResolvedValue([createEmployee(3, "Ana Silva")]);
    vi.mocked(employeeService.delete)
      .mockRejectedValueOnce(new ApiError("The request failed. Please try again.", 500))
      .mockResolvedValueOnce(undefined);

    renderAppAt("/");
    const table = await screen.findByRole("table");
    await user.click(
      within(table).getByRole("button", { name: "Open actions for Ana Silva" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(await screen.findByRole("button", { name: "Retry Delete" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "Ana Silva" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry Delete" }));

    await waitFor(() => {
      expect(employeeService.delete).toHaveBeenCalledTimes(2);
      expect(screen.getByRole("heading", { name: "No employees yet" })).toBeInTheDocument();
    });
  });

  it("creates an employee and returns to the list after success", async () => {
    const user = userEvent.setup();
    const employeeInput: EmployeeInput = {
      name: "New Employee",
      admission_date: "2024-01-10",
      rg: "987654321",
      cpf: "12345678901",
      birth_date: "1990-05-20",
      role: null,
    };
    vi.mocked(employeeService.create).mockResolvedValue({ id: 1, ...employeeInput });

    renderAppAt("/employees/new");
    await fillEmployeeForm(user);
    await user.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(employeeService.create).toHaveBeenCalledWith(employeeInput);
      expect(window.location.pathname).toBe("/");
    });
    expect(employeeService.listAll).toHaveBeenCalledTimes(2);
  });

  it("keeps the create form open and announces an API validation error", async () => {
    const user = userEvent.setup();
    vi.mocked(employeeService.create).mockRejectedValue(
      new ApiError("An employee with this CPF is already registered.", 409),
    );

    renderAppAt("/employees/new");
    await fillEmployeeForm(user);
    await user.click(screen.getByRole("button", { name: "Create Employee" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "An employee with this CPF is already registered.",
    );
    expect(window.location.pathname).toBe("/employees/new");
    expect(screen.getByRole("heading", { name: "Add Employee" })).toBeInTheDocument();
  });

  it("updates an employee and returns to the list after success", async () => {
    const user = userEvent.setup();
    const existingEmployee = createEmployee(7, "Existing Employee");
    vi.mocked(employeeService.getById).mockResolvedValue(existingEmployee);
    vi.mocked(employeeService.update).mockResolvedValue(existingEmployee);

    renderAppAt("/employees/7/edit");
    const nameField = await screen.findByRole("textbox", { name: "Name" });
    await user.clear(nameField);
    await user.type(nameField, "Updated Employee");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(employeeService.update).toHaveBeenCalledWith(7, {
        name: "Updated Employee",
        admission_date: "2024-01-10",
        rg: "123456789",
        cpf: "12345678901",
        birth_date: "1990-05-20",
        role: "Engineer",
      });
      expect(window.location.pathname).toBe("/");
    });
  });

  it("shows an accessible not-found state for a missing employee", async () => {
    vi.mocked(employeeService.getById).mockRejectedValue(
      new ApiError("Employee not found.", 404),
    );

    renderAppAt("/employees/404");

    expect(await screen.findByRole("alert")).toHaveTextContent("Employee not found.");
    expect(screen.getByRole("heading", { name: "Employee not found" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Employees" })).toBeInTheDocument();
  });
});
