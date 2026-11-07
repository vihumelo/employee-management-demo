import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import EmployeeFormFields from "../components/EmployeeFormFields";
import EmployeeFormPanel from "../components/EmployeeFormPanel";
import { getApiErrorMessage } from "../services/apiError";
import { employeeService } from "../services/employeeService";
import type { EmployeeInput } from "../types/employee";
import type { EmployeeListOutletContext } from "./EmployeeListPage";

const initialEmployee: EmployeeInput = {
  name: "",
  admission_date: "",
  rg: "",
  cpf: "",
  birth_date: "",
  role: null,
};

const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const { refreshEmployees } = useOutletContext<EmployeeListOutletContext>();
  const [employee, setEmployee] = useState<EmployeeInput>(initialEmployee);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = <Field extends keyof EmployeeInput>(
    field: Field,
    value: EmployeeInput[Field],
  ) => {
    setEmployee((currentEmployee) => ({ ...currentEmployee, [field]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await employeeService.create(employee);
      refreshEmployees();
      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setIsSaving(false);
      return false;
    }
  };

  return (
    <EmployeeFormPanel
      title="Add Employee"
      description="Enter the employee details below."
      submitLabel="Create Employee"
      isSaving={isSaving}
      errorMessage={errorMessage}
      onClose={() => navigate("/")}
      onSubmit={handleSubmit}
    >
      <EmployeeFormFields
        value={employee}
        onFieldChange={updateField}
        isDisabled={isSaving}
      />
    </EmployeeFormPanel>
  );
};

export default EmployeeCreatePage;
