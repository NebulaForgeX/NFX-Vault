import type { ButtonProps as RadixButtonProps } from "@radix-ui/themes";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { forwardRef } from "react";
import { Button as RadixButton, Flex } from "@radix-ui/themes";

type LegacyVariant = "primary" | "secondary" | "outline" | "ghost" | "default";
type LegacySize = "small" | "medium" | "large";

export type ButtonProps = Omit<RadixButtonProps, "variant" | "size"> &
  Omit<ComponentPropsWithoutRef<"button">, "color" | "size"> & {
    variant?: LegacyVariant | RadixButtonProps["variant"];
    size?: LegacySize | RadixButtonProps["size"];
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    iconOnly?: boolean;
  };

function mapVariant(variant: ButtonProps["variant"]): RadixButtonProps["variant"] {
  if (variant === "primary" || variant === "default") return "solid";
  if (variant === "secondary") return "soft";
  if (variant === "outline" || variant === "ghost") return variant;
  return variant ?? "solid";
}

function mapSize(size: ButtonProps["size"]): RadixButtonProps["size"] {
  if (size === "small") return "1";
  if (size === "medium") return "2";
  if (size === "large") return "3";
  return size ?? "2";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "medium", loading, fullWidth, leftIcon, iconOnly, children, style, ...props }, ref) => {
    return (
      <RadixButton
        ref={ref}
        variant={mapVariant(variant)}
        size={mapSize(size)}
        loading={loading}
        style={{ width: fullWidth ? "100%" : undefined, ...style }}
        {...props}
      >
        {leftIcon || iconOnly ? (
          <Flex align="center" gap="2">
            {leftIcon}
            {!iconOnly ? children : null}
          </Flex>
        ) : (
          children
        )}
      </RadixButton>
    );
  },
);

Button.displayName = "Button";
export default Button;
