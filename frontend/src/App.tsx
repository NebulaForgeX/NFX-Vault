import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes } from "react-router-dom";

import { TruckLoading } from "nfx-ui/animations";

import { AppLayout } from "@/layouts";
import {
  AccountPage,
  DashboardPage,
  CertCheckPage,
  CertDetailPage,
  CertAddPage,
  CertEditPage,
  TLSAnalysisPage,
  FileFolderPage,
  LoginPage,
} from "@/pages";
import { useAuthInit } from "@/hooks/useAuthInit";
import { ROUTES } from "@/navigations";
import { useAuthStore } from "@/stores/authStore";

import styles from "./App.module.css";

function App() {
  const { t } = useTranslation("common");
  const { isInitialized } = useAuthInit();
  const isAuthValid = useAuthStore((state) => state.isAuthValid);

  useEffect(() => {
    document.title = `${t("title")} - ${t("subtitle")}`;
  }, [t]);

  if (!isInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <TruckLoading size="medium" />
        <p className={styles.loadingText}>验证中...</p>
      </div>
    );
  }

  if (!isAuthValid) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<DashboardPage />} />
        <Route path={ROUTES.CHECK} element={<CertCheckPage />} />
        <Route path={ROUTES.CERT_ADD} element={<CertAddPage />} />
        <Route path={ROUTES.CERT_EDIT} element={<CertEditPage />} />
        <Route path={ROUTES.CERT_DETAIL} element={<CertDetailPage />} />
        <Route path={ROUTES.ANALYSIS_TLS} element={<TLSAnalysisPage />} />
        <Route path={ROUTES.FILE_FOLDER} element={<FileFolderPage />} />
        <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
