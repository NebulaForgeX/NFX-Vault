import { memo } from "react";
import { Button } from "nfx-ui/components";

export interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
  children?: React.ReactNode;
}

const IconButton = memo(({ icon, children, ...props }: IconButtonProps) => (
  <Button
    {...props}
    leftIcon={icon}
    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", ...props.style }}
  >
    {children}
  </Button>
));

IconButton.displayName = "IconButton";

export default IconButton;
