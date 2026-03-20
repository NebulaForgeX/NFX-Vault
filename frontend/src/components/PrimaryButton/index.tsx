import type { MouseEventHandler } from "react";
import { memo } from "react";

import styles from "./styles.module.css";

export interface PrimaryButtonProps {
  text: string;
  handler: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  /** BaseModal 等全宽主按钮 */
  fullWidth?: boolean;
}

const PrimaryButton = memo(({ text, handler, disabled, className = "", fullWidth }: PrimaryButtonProps) => (
  <button
    type="button"
    className={`${styles.root} ${fullWidth ? styles.fullWidth : ""} ${className}`.trim()}
    onClick={handler}
    disabled={disabled}
  >
    {text}
  </button>
));

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
