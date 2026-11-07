import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AppButton from "../components/ui/AppButton";
import SurfaceCard from "../components/ui/SurfaceCard";
import EmployeeFormFields from "../components/EmployeeFormFields";
import EmployeeFormPanel from "../components/EmployeeFormPanel";
import { getApiErrorMessage } from "../services/apiError";
import { employeeService } from "../services/employeeService";
import type { Employee, EmployeeInput } from "../types/employee";
import type { EmployeeListOutletContext } from "./EmployeeListPage";

const EmployeeEditPage = () => {
  const navigate = useNavigate();
  const { refreshEmployees } = useOutletContext<EmployeeListOutletContext>();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<EmployeeInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const parsedEmployeeId = Number(employeeId);
  const isValidEmployeeId =
    employeeId !== undefined &&
    Number.isInteger(parsedEmployeeId) &&
    parsedEmployeeId > 0;

  useEffect(() => {
    const controller = new AbortController();
    setEmployee(null);
    setEditedEmployee(null);
    setErrorMessage(null);
    setIsLoading(true);

    if (!isValidEmployeeId) {
      setErrorMessage("Invalid employee ID.");
      setIsLoading(false);
      return () => controller.abort();
    }

    employeeService
      .getById(parsedEmployeeId, controller.signal)
      .then((loadedEmployee) => {
        setEmployee(loadedEmployee);
        setEditedEmployee({
          name: loadedEmployee.name,
          admission_date: loadedEmployee.admission_date,
          rg: loadedEmployee.rg,
          cpf: loadedEmployee.cpf,
          birth_date: loadedEmployee.birth_date,
          role: loadedEmployee.role,
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [employeeId, isValidEmployeeId, parsedEmployeeId]);

  const updateField = <Field extends keyof EmployeeInput>(
    field: Field,
    value: EmployeeInput[Field],
  ) => {
    setErrorMessage(null);
    setEditedEmployee((currentEmployee) =>
      currentEmployee ? { ...currentEmployee, [field]: value } : null,
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    if (!editedEmployee || !isValidEmployeeId) return false;

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await employeeService.update(parsedEmployeeId, editedEmployee);
      refreshEmployees();
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setIsSaving(false);
      return false;
    }
  };

  const closePanel = () => navigate("/");

  if (isLoading || !employee || !editedEmployee || employee.id !== parsedEmployeeId) {
    return (
      <aside className="employee-form-panel" aria-live="polite">
        <SurfaceCard className="employee-form-panel-card">
          <div className="employee-form-panel-heading">
            <div>
              <h2>{isLoading ? "Loading Employee" : "Edit Employee"}</h2>
              <p>{isLoading ? "Loading employee details…" : "Unable to load this employee."}</p>
            </div>
            <AppButton
              type="button"
              variant="tertiary"
              isIconOnly
              aria-label="Close employee form"
              onPress={closePanel}
            >
              <span aria-hidden="true">×</span>
            </AppButton>
          </div>
          {isLoading ? (
            <p role="status">Loading employee…</p>
          ) : (
            <>
              <p className="feedback-message" role="alert">
                {errorMessage ?? "Employee not found."}
              </p>
              <AppButton type="button" variant="secondary" onPress={closePanel}>
                Back to Employees
              </AppButton>
            </>
          )}
        </SurfaceCard>
      </aside>
    );
  }

  return (
    <EmployeeFormPanel
      title="Edit Employee"
      description={`Update the details for ${employee.name}.`}
      submitLabel="Save Changes"
      isSaving={isSaving}
      errorMessage={errorMessage}
      onClose={closePanel}
      onSubmit={handleSubmit}
    >
      <EmployeeFormFields
        value={editedEmployee}
        onFieldChange={updateField}
        isDisabled={isSaving}
      />
    </EmployeeFormPanel>
  );
};

export default EmployeeEditPage;
