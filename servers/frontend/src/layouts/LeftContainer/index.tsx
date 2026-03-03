import type { ThemeEnum } from "nfx-ui/themes";

import { memo } from "react";
import { SlideDownSwitcher } from "nfx-ui/components";
import { useLayoutLabel, useThemeLabel } from "nfx-ui/languages";
import { LAYOUT_MODE_VALUES, LayoutModeEnum, useLayout } from "nfx-ui/layouts";
import { useTheme } from "nfx-ui/themes";
import { useTranslation } from "react-i18next";

import { Menu } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import styles from "./styles.module.css";

const LeftContainer = memo(() => {
  const { t } = useTranslation("navigation");
  const { themeName, setTheme, availableThemes } = useTheme();
  const { toggleSidebar, layoutMode, setLayoutMode } = useLayout();
  const { getThemeDisplayName } = useThemeLabel();
  const { getLayoutDisplayName } = useLayoutLabel();

  const handleThemeChange = (theme: ThemeEnum) => {
    setTheme(theme);
  };
  const handleLayoutChange = (mode: LayoutModeEnum) => {
    setLayoutMode(mode);
  };

  return (
    <div className={styles.headerContainer}>
      <button type="button" className={styles.sidebarToggle} onClick={toggleSidebar}>
        <Menu size={28} />
      </button>

      <button type="button" className={styles.logo} onClick={() => routerEventEmitter.navigate({ to: ROUTES.HOME })}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        <span>{t("appName")}</span>
      </button>

      <SlideDownSwitcher
        value={themeName}
        options={availableThemes}
        getDisplayName={getThemeDisplayName}
        onChange={handleThemeChange}
        status="default"
      />
      <SlideDownSwitcher
        value={layoutMode}
        options={LAYOUT_MODE_VALUES}
        getDisplayName={getLayoutDisplayName}
        onChange={handleLayoutChange}
        status="default"
      />
    </div>
  );
});

LeftContainer.displayName = "LeftContainer";

export default LeftContainer;
