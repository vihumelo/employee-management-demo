import { Chip } from "@heroui/react";

interface RoleBadgeProps {
  role: string | null;
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const label = role?.trim() || "Unassigned";
  const normalizedRole = label.toLowerCase();
  const tone = /analyst|data|finance/.test(normalizedRole)
    ? "blue"
    : /manager|lead|director/.test(normalizedRole)
      ? "green"
      : "violet";

  return (
    <Chip
      className={`role-badge role-badge--${tone}`}
      variant="soft"
      color="accent"
      size="sm"
    >
      {label}
    </Chip>
  );
};

export default RoleBadge;
