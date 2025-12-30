import type { ReactNode } from "react";
import type { SidebarProps as ProSidebarProps } from "react-pro-sidebar";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Home, Plus, Shield, FileSearch } from "@/assets/icons/lucide";
import { Menu, MenuItem, Sidebar as ProSidebar, SubMenu } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";

import { isActiveRoute, ROUTES } from "@/types/navigation";

import styles from "./styles.module.css";

interface SidebarProps extends Omit<ProSidebarProps, "breakPoint"> {
  children?: ReactNode;
  collapsed?: boolean;
  toggled?: boolean;
  onBackdropClick?: () => void;
  className?: string;
  breakPoint?: string;
}

const Sidebar = memo(
  ({ children, collapsed = false, toggled = false, onBackdropClick, breakPoint = "all", className }: SidebarProps) => {
    const { t } = useTranslation("navigation");
    const location = useLocation();

    return (
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={onBackdropClick}
        breakPoint={breakPoint as any}
        backgroundColor="var(--color-bg-2)"
        rootStyles={{
          border: "none",
          borderRight: "1px solid var(--color-separator)",
        }}
        className={`${styles.sidebar} ${className || ""}`}
      >
        <div className={styles.sidebarContent}>
          {children || (
            <Menu
              key={`${collapsed}-${toggled}`}
              transitionDuration={300}
              closeOnClick
              menuItemStyles={{
                button: {
                  color: "var(--color-fg-text)",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "var(--color-bg-3)",
                    color: "var(--color-fg-text)",
                  },
                  "&.active": {
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                  },
                },
                icon: {
                  color: "var(--color-fg-text)",
                  "&.active": {
                    color: "#ffffff",
                  },
                },
                label: {
                  color: "var(--color-fg-text)",
                  "&.active": {
                    color: "#ffffff",
                  },
                },
              }}
            >
              <MenuItem
                icon={<Home size={20} />}
                component={<Link to={ROUTES.HOME} />}
                active={isActiveRoute(location.pathname, ROUTES.HOME)}
              >
                {t("home")}
              </MenuItem>

              <SubMenu
                label={t("certManagement")}
                icon={<Shield size={20} />}
                active={
                  isActiveRoute(location.pathname, ROUTES.CHECK) ||
                  isActiveRoute(location.pathname, ROUTES.CERT_ADD) ||
                  isActiveRoute(location.pathname, ROUTES.CERT_APPLY)
                }
              >
                <MenuItem
                  icon={<Shield size={18} />}
                  component={<Link to={ROUTES.CHECK} />}
                  active={isActiveRoute(location.pathname, ROUTES.CHECK)}
                >
                  {t("certList")}
                </MenuItem>
                <MenuItem
                  icon={<Plus size={18} />}
                  component={<Link to={ROUTES.CERT_ADD} />}
                  active={isActiveRoute(location.pathname, ROUTES.CERT_ADD)}
                >
                  {t("addCert")}
                </MenuItem>
                <MenuItem
                  icon={<Plus size={18} />}
                  component={<Link to={ROUTES.CERT_APPLY} />}
                  active={isActiveRoute(location.pathname, ROUTES.CERT_APPLY)}
                >
                  {t("applyCert")}
                </MenuItem>
              </SubMenu>

              <SubMenu
                label={t("analysis")}
                icon={<FileSearch size={20} />}
                active={isActiveRoute(location.pathname, ROUTES.ANALYSIS_TLS)}
              >
                <MenuItem
                  icon={<FileSearch size={18} />}
                  component={<Link to={ROUTES.ANALYSIS_TLS} />}
                  active={isActiveRoute(location.pathname, ROUTES.ANALYSIS_TLS)}
                >
                  {t("analyzeTLS")}
                </MenuItem>
              </SubMenu>
            </Menu>
          )}
        </div>
      </ProSidebar>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
