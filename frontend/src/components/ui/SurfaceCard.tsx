import type { ReactNode } from "react";
import { Card } from "@heroui/react";

interface SurfaceCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const SurfaceCard = ({
  children,
  title,
  description,
  footer,
  className = "",
  contentClassName = "",
}: SurfaceCardProps) => (
  <Card className={`surface-card ${className}`.trim()}>
    {(title || description) && (
      <Card.Header className="surface-card-header">
        <div>
          {title && <Card.Title>{title}</Card.Title>}
          {description && <Card.Description>{description}</Card.Description>}
        </div>
      </Card.Header>
    )}
    <Card.Content className={`surface-card-content ${contentClassName}`.trim()}>
      {children}
    </Card.Content>
    {footer && <Card.Footer className="surface-card-footer">{footer}</Card.Footer>}
  </Card>
);

export default SurfaceCard;
