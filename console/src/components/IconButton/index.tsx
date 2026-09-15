import type { ComponentProps, ReactNode } from "react";

import { memo } from "react";

import Button from "@/components/Button";

export interface IconButtonProps extends ComponentProps<typeof Button> {
  icon: ReactNode;
  children?: ReactNode;
}

const IconButton = memo(({ icon, children, ...props }: IconButtonProps) => (
  <Button {...props} leftIcon={icon}>
    {children}
  </Button>
));

IconButton.displayName = "IconButton";
export default IconButton;
