import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showSuccess, showError } from "@/stores/modalStore";
import { ExportSingleCertificate } from "@/apis/file.api";

interface UseExportToFolderProps {
  certificateId?: string;
}

export const useExportToFolder = ({ certificateId }: UseExportToFolderProps) => {
  const { t } = useTranslation("certDetail");

  const exportToApiFolder = useCallback(async () => {
    if (!certificateId) {
      showError(t("export.error.noCertificateId") || "Certificate ID is required");
      return;
    }

    try {
      const result = await ExportSingleCertificate({
        certificate_id: certificateId,
        store: "apis",
      });

      if (result.success) {
        showSuccess(
          result.message || 
          t("export.success.apiFolder") || 
          `Certificate exported to APIs/${result.folder_name || ""}`
        );
      } else {
        showError(result.message || t("export.error.failed") || "Failed to export certificate");
      }
    } catch (error) {
      console.error("Export to API folder failed:", error);
      showError(t("export.error.failed") || "Failed to export certificate");
    }
  }, [certificateId, t]);

  const exportToWebsitesFolder = useCallback(async () => {
    if (!certificateId) {
      showError(t("export.error.noCertificateId") || "Certificate ID is required");
      return;
    }

    try {
      const result = await ExportSingleCertificate({
        certificate_id: certificateId,
        store: "websites",
      });

      if (result.success) {
        showSuccess(
          result.message || 
          t("export.success.websitesFolder") || 
          `Certificate exported to Websites/${result.folder_name || ""}`
        );
      } else {
        showError(result.message || t("export.error.failed") || "Failed to export certificate");
      }
    } catch (error) {
      console.error("Export to Websites folder failed:", error);
      showError(t("export.error.failed") || "Failed to export certificate");
    }
  }, [certificateId, t]);

  return {
    exportToApiFolder,
    exportToWebsitesFolder,
  };
};

export default useExportToFolder;

