import { Button, Flex } from "@radix-ui/themes";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { PageFrame } from "@/layouts";

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  return (
    <PageFrame>
      <EmptyState
        icon={Info}
        title={t("notFound.title", { defaultValue: "Page not found" })}
        description={t("notFound.description", { defaultValue: "The page might have been moved or deleted." })}
        action={
          <Flex gap="3">
            <Button onClick={() => routerEventEmitter.navigateToDashboard()}>{t("notFound.goHome", { defaultValue: "Go to certificates" })}</Button>
          </Flex>
        }
      />
    </PageFrame>
  );
}
