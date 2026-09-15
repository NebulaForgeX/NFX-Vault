import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { forwardRef } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";

export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "color"> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: string;
  leftIcon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className,
      variant: _variant,
      leftIcon,
      defaultValue,
      value,
      onChange,
      onBlur,
      name,
      type,
      placeholder,
      disabled,
      required,
      autoComplete,
      id,
    },
    ref,
  ) => {
    return (
      <Flex direction="column" gap="1" width={fullWidth ? "100%" : undefined} className={className}>
        {label ? (
          <Text as="label" size="2" weight="medium">
            {label}
          </Text>
        ) : null}
        <TextField.Root
          ref={ref}
          color={error ? "red" : undefined}
          value={value as string | number | undefined}
          defaultValue={typeof defaultValue === "string" || typeof defaultValue === "number" ? defaultValue : undefined}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          type={type === "file" ? "text" : (type as "text" | "password" | "email" | "search" | undefined)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          id={id}
        >
          {leftIcon ? <TextField.Slot>{leftIcon}</TextField.Slot> : null}
        </TextField.Root>
        {error ? (
          <Text size="1" color="red">
            {error}
          </Text>
        ) : helperText ? (
          <Text size="1" color="gray">
            {helperText}
          </Text>
        ) : null}
      </Flex>
    );
  },
);

Input.displayName = "Input";
export default Input;
