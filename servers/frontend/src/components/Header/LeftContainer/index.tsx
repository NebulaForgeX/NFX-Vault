import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "@/assets/icons/lucide";

import { LayoutSwitcher, ThemeSwitcher } from "@/components";

import styles from "./styles.module.css";

interface LeftContainerProps {
  onToggleSidebar?: () => void;
  onNavigateHome?: () => void;
}

const LeftContainer = memo(({ onToggleSidebar, onNavigateHome }: LeftContainerProps) => {
  const { t } = useTranslation("navigation");

  return (
    <div className={styles.headerContainer}>
      {/* 侧边栏切换按钮 */}
      <button
        type="button"
        className={styles.sidebarToggle}
        onClick={() => {
          onToggleSidebar?.();
        }}
      >
        <Menu size={28} />
      </button>

      {/* Logo */}
      <button
        type="button"
        className={styles.logo}
        onClick={() => {
          onNavigateHome?.();
        }}
      >
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        <span>{t("appName")}</span>
      </button>

      {/* 主题/布局 切换器 */}
      <ThemeSwitcher status="primary" />
      <LayoutSwitcher status="default" />
    </div>
  );
});

LeftContainer.displayName = "LeftContainer";

export default LeftContainer;
