import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showSuccess, showError } from "nfx-ui/stores";

import { useExportSingleCertificate } from "@/hooks/file";

interface UseExportToFolderProps {
  certificateId?: string;
}

export const useExportToFolder = ({ certificateId }: UseExportToFolderProps) => {
  const { t } = useTranslation("certDetail");
  const exportMutation = useExportSingleCertificate();

  const exportToWebsitesFolder = useCallback(async () => {
    if (!certificateId) {
      showError(t("export.error.noCertificateId") || "Certificate ID is required");
      return;
    }

    try {
      const result = await exportMutation.mutateAsync(certificateId);

      if (result.success) {
        showSuccess(
          result.message ||
            t("export.success.websitesFolder") ||
            `Certificate exported to Websites/${result.folderName || ""}`,
        );
      } else {
        showError(result.message || t("export.error.failed") || "Failed to export certificate");
      }
    } catch (error) {
      console.error("Export to Websites folder failed:", error);
      showError(t("export.error.failed") || "Failed to export certificate");
    }
  }, [certificateId, exportMutation, t]);

  return {
    exportToWebsitesFolder,
  };
};

export default useExportToFolder;
