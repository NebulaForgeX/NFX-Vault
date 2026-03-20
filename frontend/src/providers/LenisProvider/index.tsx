import type { ReactNode } from "react";

import { ReactLenis } from "lenis/react";

/**
 * 与 Pqttec-Admin 一致：根级 Lenis 平滑滚动（使用默认 RAF，避免额外绑定 gsap/motion）。
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root>
      {children}
    </ReactLenis>
  );
}
