import { memo } from "react";
import { useTranslation } from "react-i18next";

import { LayoutSwitcher } from "nfx-ui/components";
import { useLayout } from "nfx-ui/layouts";

import { Button } from "@/components";
import { Menu } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import styles from "./styles.module.css";

const LeftContainer = memo(() => {
  const { t } = useTranslation("navigation");
  const { toggleSidebar } = useLayout();

  return (
    <div className={styles.headerContainer}>
      <Button
        type="button"
        variant="ghost"
        iconOnly
        leftIcon={<Menu size={28} />}
        onClick={toggleSidebar}
        className={styles.sidebarToggle}
        aria-label="Toggle sidebar"
      />

      <Button type="button" variant="ghost" onClick={() => routerEventEmitter.navigate({ to: ROUTES.HOME })} className={styles.logo}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        <span>{t("appName")}</span>
      </Button>

      <LayoutSwitcher />
    </div>
  );
});

LeftContainer.displayName = "LeftContainer";
export default LeftContainer;
