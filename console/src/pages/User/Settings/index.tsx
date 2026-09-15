import { Flex } from "@radix-ui/themes";
import { Settings2 } from "lucide-react";
import { PageHeader, ThemeSettings } from "nfx-ui/components";
import { PageFrame } from "nfx-ui/layouts";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation("pages.User.Settings");

  return (
    <PageFrame>
      <PageHeader icon={Settings2} title={t("title")} description={t("subtitle")} />
      <Flex direction="column" gap="6" width="100%">
        <ThemeSettings />
      </Flex>
    </PageFrame>
  );
}
