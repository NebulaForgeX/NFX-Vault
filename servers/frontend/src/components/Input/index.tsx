import type { InputHTMLAttributes } from "react";

import { memo, forwardRef } from "react";

import styles from "./styles.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className || ""}`}
        {...props}
      />
    );
  })
);

Input.displayName = "Input";

export default Input;

