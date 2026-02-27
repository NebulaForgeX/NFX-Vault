import { memo } from "react";
import { Button } from "@/components";

export interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const IconButton = memo(({ icon, children, ...props }: IconButtonProps) => (
  <Button {...props} style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...props.style }}>
    {icon}
    {children}
  </Button>
));

IconButton.displayName = "IconButton";

export default IconButton;

