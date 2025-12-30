import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { LayoutSwitcher } from "@/layouts";
import { DashboardPage, CertCheckPage, CertDetailPage, CertAddPage, CertEditPage, CertApplyPage, CertEditApplyPage, TLSAnalysisPage } from "@/pages";
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
        <Route path={ROUTES.ANALYSIS_TLS} element={<TLSAnalysisPage />} />
      </Routes>
    </LayoutSwitcher>
  );
}

export default App;
