import type { ComponentProps } from "react";
import { Button as HeroUIButton } from "@heroui/react";

type HeroUIButtonProps = ComponentProps<typeof HeroUIButton>;

interface AppButtonProps extends Omit<HeroUIButtonProps, "variant"> {
  variant?: HeroUIButtonProps["variant"];
}

const AppButton = ({ className = "", variant = "primary", ...props }: AppButtonProps) => (
  <HeroUIButton
    {...props}
    className={`app-button ${className}`.trim()}
    variant={variant}
  />
);

export default AppButton;
