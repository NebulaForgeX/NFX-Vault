import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "@/assets/icons/lucide";
import { IconButton } from "@/components";
import { useDownloadCertificate } from "../../hooks";
import styles from "./styles.module.css";

interface ExportCertificateProps {
  certificate: string;
  privateKey: string;
  domain: string;
}

const ExportCertificate = memo(({
  certificate,
  privateKey,
  domain,
}: ExportCertificateProps) => {
  const { t } = useTranslation("certDetail");
  const { downloadCertificate, downloadPrivateKey, downloadBoth } = useDownloadCertificate({
    certificate,
    privateKey,
    domain,
  });

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("export.title") || "Export Certificate"}</h2>
      <div className={styles.buttonGroup}>
        <IconButton onClick={downloadCertificate} variant="primary" icon={<Download size={16} />}>
          {t("download.certificate") || "Download Certificate"}
        </IconButton>
        <IconButton onClick={downloadPrivateKey} variant="primary" icon={<Download size={16} />}>
          {t("download.privateKey") || "Download Private Key"}
        </IconButton>
        <IconButton onClick={downloadBoth} variant="secondary" icon={<Download size={16} />}>
          {t("download.both") || "Download Both"}
        </IconButton>
      </div>
    </div>
  );
});

ExportCertificate.displayName = "ExportCertificate";

export default ExportCertificate;

