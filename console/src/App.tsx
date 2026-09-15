import { Navigate, Route, Routes } from "react-router";
import { useAuthStore, hasSelectedProfile } from "nfx-ui/stores";

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
  SelectProfilePage,
  SettingsPage,
} from "@/pages";
import { ROUTES } from "@/navigations";
import { VaultOverlays } from "@/overlays";

import "./App.module.css";

function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const profileId = useAuthStore((state) => state.currentProfileId);
  const isAuthValid = useAuthStore((state) => state.isAuthValid);

  if (!accessToken) {
    return (
      <>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
        <VaultOverlays />
      </>
    );
  }

  if (!isAuthValid || !hasSelectedProfile(profileId)) {
    return (
      <>
        <Routes>
          <Route path={ROUTES.SELECT_PROFILE} element={<SelectProfilePage />} />
          <Route path="*" element={<Navigate to={ROUTES.SELECT_PROFILE} replace />} />
        </Routes>
        <VaultOverlays />
      </>
    );
  }

  return (
    <>
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
          <Route path={ROUTES.USER_SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </AppLayout>
      <VaultOverlays />
    </>
  );
}

export default App;
