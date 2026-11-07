import AppTextField from "./AppTextField";

interface SearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const SearchField = ({
  value,
  onValueChange,
  placeholder = "Search employees",
  isDisabled = false,
}: SearchFieldProps) => (
  <div className="search-field">
    <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
    <AppTextField
      className="search-field-control"
      name="employee-search"
      label="Search employees"
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      isLabelHidden
      isDisabled={isDisabled}
    />
  </div>
);

export default SearchField;
