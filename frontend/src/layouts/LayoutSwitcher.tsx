import { memo } from "react";
import AppLayout from "./AppLayout";

interface LayoutSwitcherProps {
  children: React.ReactNode;
}

/** 与 Sjgz-Admin 一致：使用 nfx-ui LayoutFrame，由 AppLayout 统一渲染。 */
const LayoutSwitcher = memo(({ children }: LayoutSwitcherProps) => (
  <AppLayout>{children}</AppLayout>
));

LayoutSwitcher.displayName = "LayoutSwitcher";
export default LayoutSwitcher;
