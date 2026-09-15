import { memo } from "react";
import { useTranslation } from "react-i18next";
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
      <div className={`${styles.terminal} ${styles.terminalKey}`}>
        <div className={styles.terminalChrome} aria-hidden>
          <span className={styles.terminalDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
          <span className={styles.terminalLabel}>PEM · PRIVATE</span>
        </div>
        <textarea
          className={styles.textArea}
          value={privateKey}
          readOnly
          spellCheck={false}
          rows={14}
          aria-label={t("certificate.privateKey") || "Private key PEM"}
        />
      </div>
    </div>
  );
});

PrivateKeyContent.displayName = "PrivateKeyContent";

export default PrivateKeyContent;

