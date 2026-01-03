import { memo } from "react";
import { useTranslation } from "node_modules/react-i18next";
import { Copy } from "@/assets/icons/lucide";
import { IconButton } from "@/components";
import styles from "./styles.module.css";

interface PrivateKeyContentProps {
  privateKey: string;
  onCopy: () => void;
}

const PrivateKeyContent = memo(({ privateKey, onCopy }: PrivateKeyContentProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("certificate.privateKey") || "Private Key"}</h2>
        <IconButton onClick={onCopy} variant="secondary" icon={<Copy size={16} />}>
          {t("copy.privateKey") || "Copy Private Key"}
        </IconButton>
      </div>
      <textarea className={styles.textArea} value={privateKey} readOnly rows={10} />
    </div>
  );
});

PrivateKeyContent.displayName = "PrivateKeyContent";

export default PrivateKeyContent;

