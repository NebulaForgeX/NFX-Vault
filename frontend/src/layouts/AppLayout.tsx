/**
 * 使用 NFX-UI LayoutFrame：与 Sjgz-Admin 一致，整块布局由 nfx-ui 渲染。
 */
import type { SidebarMenuItem } from "nfx-ui/layouts";
import type { ReactNode } from "react";

import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { Footer, LayoutFrame } from "nfx-ui/layouts";

import { Home, Shield, FileSearch, Folder, List, FilePlus, Scan, Globe } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import LeftContainer from "./LeftContainer";
import RightContainer from "./RightContainer";

const size20 = 20;
const size18 = 18;

function useSidebarItems(): SidebarMenuItem[] {
  const { t } = useTranslation("navigation");
  return useMemo(
    () => [
      {
        label: t("home"),
        path: ROUTES.HOME,
        icon: <Home size={size20} />,
      },
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
  const { t } = useTranslation("common");
  const location = useLocation();
  const sidebarItems = useSidebarItems();

  const onSidebarNavigate = useCallback((path: string) => {
    routerEventEmitter.navigate({ to: path });
  }, []);

  return (
    <LayoutFrame
      headerLeft={<LeftContainer />}
      headerRight={<RightContainer />}
      footerContent={
        <Footer>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "1rem 0",
            }}
          >
            <span>
              © {new Date().getFullYear()} {t("footer.copyright")}
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <a href="#">{t("footer.about")}</a>
              <a href="#">{t("footer.privacy")}</a>
              <a href="#">{t("footer.terms")}</a>
            </div>
          </div>
        </Footer>
      }
      sidebarItems={sidebarItems}
      sidebarCurrentPathname={location.pathname}
      onSidebarNavigate={onSidebarNavigate}
    >
      <div style={{ marginTop: "2rem", marginBottom: "8rem" }}>{children}</div>
    </LayoutFrame>
  );
});

AppLayout.displayName = "AppLayout";
export default AppLayout;
