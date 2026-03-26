import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/layouts";
import { DashboardPage, CertCheckPage, CertDetailPage, CertAddPage, CertEditPage, TLSAnalysisPage, FileFolderPage } from "@/pages";
import { ROUTES } from "@/navigations";

function App() {
  const { t } = useTranslation("common");

  useEffect(() => {
    document.title = `${t("title")} - ${t("subtitle")}`;
  }, [t]);

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
      </Routes>
    </AppLayout>
  );
}

export default App;
