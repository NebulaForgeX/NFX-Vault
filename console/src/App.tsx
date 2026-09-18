import { GuestRoute, ProtectedRoute } from "nfx-ui/navigations";
import { Navigate, Route, Routes } from "react-router";

import { Main, Sidebar } from "@/layouts";
import { ROUTES } from "@/navigations";
import {
  CertAddPage,
  CertCheckPage,
  CertDetailPage,
  CertEditPage,
  DashboardPage,
  DnsDomainPage,
  DnsPage,
  FileFolderPage,
  LoginPage,
  NotFoundPage,
  ProfileEditPage,
  ProfileIdentitiesPage,
  ProfileOverviewPage,
  SettingsPage,
  SignupPage,
  TLSAnalysisPage,
} from "@/pages";

export default function App() {
  return (
    <Routes>
      <Route element={<Main />}>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Route>

      <Route element={<ProtectedRoute redirectTo={ROUTES.LOGIN} />}>
        <Route element={<Sidebar />}>
          <Route path={ROUTES.USER} element={<Navigate to={ROUTES.CHECK} replace />} />
          <Route path={ROUTES.USER_OVERVIEW} element={<DashboardPage />} />
          <Route path={ROUTES.CHECK} element={<CertCheckPage />} />
          <Route path={ROUTES.CERT_ADD} element={<CertAddPage />} />
          <Route path={ROUTES.CERT_EDIT} element={<CertEditPage />} />
          <Route path={ROUTES.CERT_DETAIL} element={<CertDetailPage />} />
          <Route path={ROUTES.ANALYSIS_TLS} element={<TLSAnalysisPage />} />
          <Route path={ROUTES.FILE_FOLDER} element={<FileFolderPage />} />
          <Route path={ROUTES.DNS} element={<DnsPage />} />
          <Route path={ROUTES.DNS_DOMAIN} element={<DnsDomainPage />} />
          <Route path={ROUTES.PROFILE} element={<Navigate to={ROUTES.USER_PROFILE_OVERVIEW} replace />} />
          <Route path={ROUTES.USER_PROFILE_OVERVIEW} element={<ProfileOverviewPage />} />
          <Route path={ROUTES.USER_PROFILE_EDIT} element={<ProfileEditPage />} />
          <Route path={ROUTES.USER_PROFILE_IDENTITIES} element={<ProfileIdentitiesPage />} />
          <Route path={ROUTES.USER_SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<GuestRoute redirectTo={ROUTES.CHECK} />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
