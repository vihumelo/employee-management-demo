import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppButton from "../components/ui/AppButton";
import RoleBadge from "../components/ui/RoleBadge";
import SurfaceCard from "../components/ui/SurfaceCard";
import { getApiErrorMessage } from "../services/apiError";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types/employee";
import { formatEmployeeDate } from "../utils/employeeFormatters";
import "../styles/EmployeeDetailsPage.css";

const EmployeeDetailsPage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const parsedEmployeeId = Number(employeeId);
  const isValidEmployeeId =
    employeeId !== undefined &&
    Number.isInteger(parsedEmployeeId) &&
    parsedEmployeeId > 0;

  useEffect(() => {
    const controller = new AbortController();
    setEmployee(null);
    setLoadErrorMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    if (!isValidEmployeeId) {
      setLoadErrorMessage("Invalid employee ID.");
      setIsLoading(false);
      return () => controller.abort();
    }

    employeeService
      .getById(parsedEmployeeId, controller.signal)
      .then(setEmployee)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadErrorMessage(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [employeeId, isValidEmployeeId, parsedEmployeeId]);

  const handleDelete = async () => {
    if (!employee) return;
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await employeeService.delete(employee.id);
      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="employee-details-page">
        <SurfaceCard className="employee-details-card">
          <p role="status" aria-live="polite">Loading employee…</p>
        </SurfaceCard>
      </main>
    );
  }

  if (loadErrorMessage || !employee || employee.id !== parsedEmployeeId) {
    return (
      <main className="employee-details-page">
        <SurfaceCard className="employee-details-card">
          <h1>Employee not found</h1>
          <p className="feedback-message" role="alert">
            {loadErrorMessage ?? "This employee could not be found."}
          </p>
          <AppButton variant="secondary" onPress={() => navigate("/")}>
            Back to Employees
          </AppButton>
        </SurfaceCard>
      </main>
    );
  }

  return (
    <main className="employee-details-page">
      <SurfaceCard className="employee-details-card">
        <div className="employee-details-heading">
          <div>
            <p>Employee #{employee.id}</p>
            <h1>{employee.name}</h1>
          </div>
          <RoleBadge role={employee.role} />
        </div>

        {errorMessage && (
          <p className="feedback-message" role="alert">{errorMessage}</p>
        )}

        <dl className="employee-details-list">
          <div>
            <dt>CPF</dt>
            <dd>{employee.cpf}</dd>
          </div>
          <div>
            <dt>RG</dt>
            <dd>{employee.rg}</dd>
          </div>
          <div>
            <dt>Birth Date</dt>
            <dd>{formatEmployeeDate(employee.birth_date)}</dd>
          </div>
          <div>
            <dt>Admission Date</dt>
            <dd>{formatEmployeeDate(employee.admission_date)}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{employee.role || "Not provided"}</dd>
          </div>
        </dl>

        <div className="employee-details-actions">
          <AppButton variant="secondary" onPress={() => navigate("/")}>
            Back to Employees
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => navigate(`/employees/${employee.id}/edit`)}
          >
            Edit Employee
          </AppButton>
          <AppButton
            variant="danger"
            isPending={isDeleting}
            isDisabled={isDeleting}
            onPress={() => void handleDelete()}
          >
            {isDeleting ? "Deleting…" : "Delete Employee"}
          </AppButton>
        </div>
      </SurfaceCard>
    </main>
  );
};

export default EmployeeDetailsPage;
