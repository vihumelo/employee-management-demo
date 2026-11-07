import { Dropdown, Label } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";

interface EmployeeActionsMenuProps {
  employeeName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EmployeeActionsMenu = ({
  employeeName,
  onView,
  onEdit,
  onDelete,
}: EmployeeActionsMenuProps) => (
  <Dropdown>
    <Dropdown.Trigger
      className={`${buttonVariants({ variant: "secondary", isIconOnly: true })} app-button employee-actions-trigger`}
      aria-label={`Open actions for ${employeeName}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="19" cy="12" r="1.7" />
      </svg>
    </Dropdown.Trigger>
    <Dropdown.Popover>
      <Dropdown.Menu
        aria-label={`Actions for ${employeeName}`}
        onAction={(key) => {
          if (key === "view") onView();
          if (key === "edit") onEdit();
          if (key === "delete") onDelete();
        }}
      >
        <Dropdown.Item id="view" textValue="View details">
          <Label>View Details</Label>
        </Dropdown.Item>
        <Dropdown.Item id="edit" textValue="Edit">
          <Label>Edit</Label>
        </Dropdown.Item>
        <Dropdown.Item id="delete" textValue="Delete" variant="danger">
          <Label>Delete</Label>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
);

export default EmployeeActionsMenu;
