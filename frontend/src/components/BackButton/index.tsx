import { memo } from "react";
import { Button } from "nfx-ui/components";

import { ArrowLeft } from "@/assets/icons/lucide";

export interface BackButtonProps {
  onClick: () => void;
  /** 有文案时为 ghost + 左箭头；仅图标时 iconOnly */
  label?: string;
  className?: string;
}

/**
 * 与 Pqttec-Admin 一致：返回/后退用 nfx-ui Button，而非原生 button。
 */
const BackButton = memo(({ onClick, label, className }: BackButtonProps) => {
  if (label) {
    return (
      <Button type="button" variant="ghost" leftIcon={<ArrowLeft size={20} />} onClick={onClick} className={className}>
        {label}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="ghost"
      iconOnly
      leftIcon={<ArrowLeft size={20} />}
      onClick={onClick}
      className={className}
      aria-label="Back"
    />
  );
});

BackButton.displayName = "BackButton";

export default BackButton;
