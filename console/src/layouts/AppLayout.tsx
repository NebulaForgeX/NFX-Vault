/**
 * NFX-UI LayoutFrame — Logo + PreferencesPopover chrome, product sidebar.
 */
import type { SidebarMenuItem } from "nfx-ui/layouts";
import type { ReactNode } from "react";

import { memo, useCallback, useMemo } from "react";
import { Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { LayoutFrame } from "nfx-ui/layouts";
import { Logo, PreferencesPopover } from "nfx-ui/components";
import { AuthStore, clearAuth } from "nfx-ui/stores";

import { Home, Shield, FileSearch, Folder, List, FilePlus, Scan, Globe, User, Settings } from "@/assets/icons/lucide";
import { authEventEmitter } from "@/events/auth";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import RightContainer from "./RightContainer";

const size20 = 20;
const size18 = 18;

function useSidebarItems(): SidebarMenuItem[] {
  const { t } = useTranslation("navigation");
  return useMemo(
    () => [
      { label: t("home"), path: ROUTES.HOME, icon: <Home size={size20} /> },
      { label: t("account"), path: ROUTES.ACCOUNT, icon: <User size={size20} /> },
      { label: t("settings"), path: ROUTES.USER_SETTINGS, icon: <Settings size={size20} /> },
      {
        label: t("certManagement"),
        path: ROUTES.CHECK,
        icon: <Shield size={size20} />,
        children: [
          { label: t("certList"), path: ROUTES.CHECK, icon: <List size={size18} /> },
          { label: t("addCert"), path: ROUTES.CERT_ADD, icon: <FilePlus size={size18} /> },
        ],
      },
      {
        label: t("analysis"),
        path: ROUTES.ANALYSIS_TLS,
        icon: <FileSearch size={size20} />,
        children: [{ label: t("analyzeTLS"), path: ROUTES.ANALYSIS_TLS, icon: <Scan size={size18} /> }],
      },
      {
        label: t("fileFolder"),
        path: ROUTES.FILE_FOLDER,
        icon: <Folder size={size20} />,
        children: [{ label: t("websites"), path: ROUTES.FILE_FOLDER, icon: <Globe size={size18} /> }],
      },
    ],
    [t],
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = memo(({ children }: AppLayoutProps) => {
  const { t } = useTranslation("LoginPage");
  const location = useLocation();
  const sidebarItems = useSidebarItems();

  const onSidebarNavigate = useCallback((path: string) => {
    routerEventEmitter.navigate({ to: path });
  }, []);

  const onSidebarLogout = useCallback(() => {
    clearAuth();
    AuthStore.getState().clearAuth();
    authEventEmitter.logout();
    routerEventEmitter.navigateReplace(ROUTES.LOGIN);
  }, []);

  return (
    <LayoutFrame
      headerLeft={<Logo title="NFX" subtitle="Vault" alt="NFX" onClick={() => routerEventEmitter.navigate({ to: ROUTES.HOME })} />}
      headerRight={
        <Flex align="center" gap="3">
          <RightContainer />
          <PreferencesPopover />
        </Flex>
      }
      sidebarItems={sidebarItems}
      sidebarCurrentPathname={location.pathname}
      onSidebarNavigate={onSidebarNavigate}
      sidebarLogoutLabel={t("logout")}
      onSidebarLogout={onSidebarLogout}
    >
      {children}
    </LayoutFrame>
  );
});

AppLayout.displayName = "AppLayout";
export default AppLayout;
