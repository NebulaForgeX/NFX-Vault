import { memo, useCallback } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { FileKey, Plus, RefreshCw } from "lucide-react";
import { PageFrame } from "@/layouts";
import { PageHeader, Suspense } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useInvalidateCache } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showError, showSuccess } from "nfx-ui/stores";

import { CertList } from "./components";

const CertCheckPage = memo(() => {
  const { t } = useTranslation("certCheck");
  const navigate = useNavigate();
  const invalidateCacheMutation = useInvalidateCache();

  const handleRefresh = useCallback(async () => {
    try {
      const result = await invalidateCacheMutation.mutateAsync();
      if (result.success) {
        showSuccess(result.message || t("refresh.success") || "Cache invalidated successfully");
      } else {
        showError(result.message || t("refresh.error") || "Failed to invalidate cache");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      showError(message || t("refresh.error") || "Failed to invalidate cache");
    }
  }, [invalidateCacheMutation, t]);

  return (
    <PageFrame>
      <PageHeader
        icon={FileKey}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Flex gap="2">
            <Button variant="soft" onClick={handleRefresh} disabled={invalidateCacheMutation.isPending}>
              <RefreshCw size={16} />
              {invalidateCacheMutation.isPending ? (t("actions.refreshing") ?? "Refreshing...") : (t("actions.refresh") ?? "Refresh")}
            </Button>
            <Button onClick={() => navigate(ROUTES.CERT_ADD)}>
              <Plus size={16} />
              {t("actions.add") ?? "Add Certificate"}
            </Button>
          </Flex>
        }
      />
      <Suspense loadingText={t("actions.checking") ?? "Checking certificates..."}>
        <CertList />
      </Suspense>
    </PageFrame>
  );
});

CertCheckPage.displayName = "CertCheckPage";

export default CertCheckPage;
