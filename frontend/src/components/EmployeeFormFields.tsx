import AppTextField from "./ui/AppTextField";
import type { EmployeeInput } from "../types/employee";
import "../styles/EmployeeFormFields.css";

interface EmployeeFormFieldsProps {
  value: EmployeeInput;
  onFieldChange: <Field extends keyof EmployeeInput>(
    field: Field,
    fieldValue: EmployeeInput[Field],
  ) => void;
  isDisabled?: boolean;
}

const EmployeeFormFields = ({
  value,
  onFieldChange,
  isDisabled = false,
}: EmployeeFormFieldsProps) => (
  <div className="employee-form-fields">
    <AppTextField
      name="name"
      label="Name"
      value={value.name}
      onValueChange={(fieldValue) => onFieldChange("name", fieldValue)}
      autoComplete="name"
      maxLength={100}
      isRequired
      isDisabled={isDisabled}
    />
    <AppTextField
      name="cpf"
      label="CPF"
      value={value.cpf}
      onValueChange={(fieldValue) => onFieldChange("cpf", fieldValue)}
      inputMode="numeric"
      maxLength={100}
      isRequired
      isDisabled={isDisabled}
    />
    <AppTextField
      name="rg"
      label="RG"
      value={value.rg}
      onValueChange={(fieldValue) => onFieldChange("rg", fieldValue)}
      maxLength={100}
      isRequired
      isDisabled={isDisabled}
    />
    <div className="employee-form-date-fields">
      <AppTextField
        name="birth_date"
        label="Birth Date"
        type="date"
        value={value.birth_date}
        onValueChange={(fieldValue) => onFieldChange("birth_date", fieldValue)}
        isRequired
        isDisabled={isDisabled}
      />
      <AppTextField
        name="admission_date"
        label="Admission Date"
        type="date"
        value={value.admission_date}
        onValueChange={(fieldValue) => onFieldChange("admission_date", fieldValue)}
        isRequired
        isDisabled={isDisabled}
      />
    </div>
    <AppTextField
      name="role"
      label="Role"
      value={value.role ?? ""}
      onValueChange={(fieldValue) => onFieldChange("role", fieldValue || null)}
      placeholder="e.g. Product Designer"
      maxLength={100}
      isDisabled={isDisabled}
    />
  </div>
);

export default EmployeeFormFields;
