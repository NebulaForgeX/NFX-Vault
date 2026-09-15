import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { LayoutDashboard } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { PageHeader } from "nfx-ui/components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/navigations";

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { t: tNav } = useTranslation("navigation");

  return (
    <PageFrame>
      <PageHeader icon={LayoutDashboard} title={t("title")} description={t("subtitle")} />
      <Flex gap="4" wrap="wrap">
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <Flex direction="column" gap="3">
            <Heading size="4">{t("certManagement.title")}</Heading>
            <Text size="2" color="gray">
              {t("certManagement.description")}
            </Text>
            <Button asChild>
              <Link to={ROUTES.CHECK}>{t("certManagement.action")}</Link>
            </Button>
          </Flex>
        </Card>
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <Flex direction="column" gap="3">
            <Heading size="4">{t("quickCheck.title")}</Heading>
            <Text size="2" color="gray">
              {t("quickCheck.description")}
            </Text>
            <Button asChild>
              <Link to={ROUTES.CHECK}>{t("quickCheck.action")}</Link>
            </Button>
          </Flex>
        </Card>
        <Card size="3" style={{ flex: "1 1 240px" }}>
          <Flex direction="column" gap="3">
            <Heading size="4">{t("certAdd.title") || "Add certificate"}</Heading>
            <Text size="2" color="gray">
              {t("certAdd.subtitle") || "Manual entry or upload PEM"}
            </Text>
            <Button asChild>
              <Link to={ROUTES.CERT_ADD}>{tNav("addCert")}</Link>
            </Button>
          </Flex>
        </Card>
      </Flex>
    </PageFrame>
  );
}
