import { memo } from "react";
import { Button, Card, Flex } from "@radix-ui/themes";
import { LayoutDashboard, Shield, FilePlus, FileSearch } from "lucide-react";
import { PageFrame } from "@/layouts";
import { CardHeader, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/navigations";

const DashboardPage = memo(() => {
  const { t } = useTranslation("common");
  const { t: tNav } = useTranslation("navigation");

  return (
    <PageFrame>
      <PageHeader icon={LayoutDashboard} title={t("title")} description={t("subtitle")} />
      <Flex gap="4" wrap="wrap">
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <CardHeader icon={<Shield size={18} />} title={t("certManagement.title")} description={t("certManagement.description")} />
          <Button asChild>
            <Link to={ROUTES.CHECK}>{t("certManagement.action")}</Link>
          </Button>
        </Card>
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <CardHeader icon={<FileSearch size={18} />} title={t("quickCheck.title")} description={t("quickCheck.description")} />
          <Button asChild>
            <Link to={ROUTES.CHECK}>{t("quickCheck.action")}</Link>
          </Button>
        </Card>
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <CardHeader icon={<FilePlus size={18} />} title={t("certAdd.title") || "Add certificate"} description={t("certAdd.subtitle") || "Manual entry or upload PEM"} />
          <Button asChild>
            <Link to={ROUTES.CERT_ADD}>{tNav("addCert")}</Link>
          </Button>
        </Card>
      </Flex>
    </PageFrame>
  );
});

DashboardPage.displayName = "DashboardPage";
export default DashboardPage;
