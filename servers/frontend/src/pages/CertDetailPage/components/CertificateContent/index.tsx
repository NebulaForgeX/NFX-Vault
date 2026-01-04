import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Copy } from "@/assets/icons/lucide";
import { IconButton } from "@/components";
import styles from "./styles.module.css";

interface CertificateContentProps {
  certificate: string;
  onCopy: () => void;
}

const CertificateContent = memo(({ certificate, onCopy }: CertificateContentProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("certificate.content") || "Certificate Content"}</h2>
        <IconButton onClick={onCopy} variant="secondary" icon={<Copy size={16} />}>
          {t("copy.certificate") || "Copy Certificate"}
        </IconButton>
      </div>
      <textarea className={styles.textArea} value={certificate} readOnly rows={10} />
    </div>
  );
});

CertificateContent.displayName = "CertificateContent";

export default CertificateContent;

