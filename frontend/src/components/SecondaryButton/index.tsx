import type { MouseEventHandler } from "react";
import { memo } from "react";

import styles from "./styles.module.css";

export interface SecondaryButtonProps {
  text: string;
  handler: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

const SecondaryButton = memo(({ text, handler, disabled, className = "" }: SecondaryButtonProps) => (
  <button type="button" className={`${styles.root} ${className}`.trim()} onClick={handler} disabled={disabled}>
    {text}
  </button>
));

SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;
