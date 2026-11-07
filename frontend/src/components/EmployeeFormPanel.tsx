import type { FormEvent, FormEventHandler, ReactNode } from "react";
import { useId, useState } from "react";
import AppButton from "./ui/AppButton";
import SurfaceCard from "./ui/SurfaceCard";
import "../styles/EmployeeFormPanel.css";

interface EmployeeFormPanelProps {
  title: string;
  description: string;
  submitLabel: string;
  isSaving: boolean;
  isSubmitDisabled?: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
  children: ReactNode;
}

const EmployeeFormPanel = ({
  title,
  description,
  submitLabel,
  isSaving,
  isSubmitDisabled = false,
  errorMessage,
  onClose,
  onSubmit,
  children,
}: EmployeeFormPanelProps) => {
  const titleId = useId();
  const [isClosing, setIsClosing] = useState(false);

  const beginClosing = () => {
    if (isClosing) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    setIsClosing(true);
    window.setTimeout(onClose, 240);
  };

  const closePanel = () => {
    if (isSaving) return;
    beginClosing();
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    if (isClosing || isSaving) {
      event.preventDefault();
      return;
    }

    const didSave = await onSubmit(event);
    if (didSave) beginClosing();
  };

  return (
    <aside
      className={`employee-form-panel${isClosing ? " is-closing" : ""}`}
      aria-labelledby={titleId}
      aria-hidden={isClosing}
      inert={isClosing}
    >
      <SurfaceCard className="employee-form-panel-card">
        <div className="employee-form-panel-heading">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
          </div>
          <AppButton
            type="button"
            variant="tertiary"
            isIconOnly
            isDisabled={isSaving || isClosing}
            aria-label="Close employee form"
            className="employee-form-close"
            onPress={closePanel}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </AppButton>
        </div>

        <form className="employee-form" onSubmit={handleSubmit} aria-busy={isSaving || isClosing}>
          {errorMessage && (
            <p className="feedback-message" role="alert">
              {errorMessage}
            </p>
          )}
          {children}
          <div className="employee-form-actions">
            <AppButton
              type="button"
              variant="secondary"
              isDisabled={isSaving || isClosing}
              onPress={closePanel}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              isDisabled={isSaving || isSubmitDisabled || isClosing}
              isPending={isSaving}
            >
              {isSaving ? "Saving..." : submitLabel}
            </AppButton>
          </div>
        </form>
      </SurfaceCard>
    </aside>
  );
};

export default EmployeeFormPanel;
