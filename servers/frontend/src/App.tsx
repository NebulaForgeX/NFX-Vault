import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { LayoutSwitcher } from "@/layouts";
import { DashboardPage, CertCheckPage, CertDetailPage, CertAddPage, CertEditPage, CertApplyPage, CertEditApplyPage, CertSearchPage, TLSAnalysisPage, FileFolderPage } from "@/pages";
import { ROUTES } from "@/types/navigation";

function App() {
  const { t } = useTranslation("common");

  useEffect(() => {
    document.title = `${t("title")} - ${t("subtitle")}`;
  }, [t]);

  return (
    <LayoutSwitcher>
      <Routes>
        <Route path={ROUTES.HOME} element={<DashboardPage />} />
        <Route path={ROUTES.CHECK} element={<CertCheckPage />} />
        <Route path={ROUTES.CERT_ADD} element={<CertAddPage />} />
        <Route path={ROUTES.CERT_APPLY} element={<CertApplyPage />} />
        <Route path={ROUTES.CERT_EDIT} element={<CertEditPage />} />
        <Route path={ROUTES.CERT_EDIT_APPLY} element={<CertEditApplyPage />} />
        <Route path={ROUTES.CERT_DETAIL} element={<CertDetailPage />} />
        <Route path={ROUTES.CERT_SEARCH} element={<CertSearchPage />} />
        <Route path={ROUTES.ANALYSIS_TLS} element={<TLSAnalysisPage />} />
        <Route path={ROUTES.FILE_FOLDER_APIS} element={<FileFolderPage />} />
        <Route path={ROUTES.FILE_FOLDER_WEBSITES} element={<FileFolderPage />} />
      </Routes>
    </LayoutSwitcher>
  );
}

export default App;
