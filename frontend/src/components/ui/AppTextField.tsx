import type { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import {
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";

interface AppTextFieldProps {
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  isRequired?: boolean;
  isDisabled?: boolean;
  description?: string;
  errorMessage?: string;
  isLabelHidden?: boolean;
  className?: string;
}

const AppTextField = ({
  name,
  label,
  value,
  onValueChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  isRequired = false,
  isDisabled = false,
  description,
  errorMessage,
  isLabelHidden = false,
  className = "",
}: AppTextFieldProps) => (
  <TextField
    className={`app-text-field ${className}`.trim()}
    name={name}
    value={value}
    onChange={onValueChange}
    isRequired={isRequired}
    isDisabled={isDisabled}
    isInvalid={Boolean(errorMessage)}
  >
    <Label className={isLabelHidden ? "visually-hidden" : undefined}>{label}</Label>
    <Input
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
    />
    {description && <Description>{description}</Description>}
    {errorMessage && <FieldError>{errorMessage}</FieldError>}
  </TextField>
);

export default AppTextField;
