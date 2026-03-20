import { memo } from "react";
import { useTranslation } from "react-i18next";

import { useModalStore } from "@/stores/modalStore";

import styles from "./styles.module.css";

const LoadingModal = memo(() => {
  const { t } = useTranslation("modal");
  const isOpen = useModalStore((state) => state.loadingModal.isOpen);
  const title = useModalStore((state) => state.loadingModal.title);
  const message = useModalStore((state) => state.loadingModal.message);

  if (!isOpen) {
    return null;
  }

  const line1 = title?.trim() || t("loading.shortTitle");
  const line2 = message?.trim() || t("loading.defaultMessage");

  return (
    <div className={styles.root} role="presentation">
      <div
        className={styles.panel}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={line1}
      >
        <div className={styles.spinnerWrap} aria-hidden>
          <span className={styles.spinner} />
        </div>
        <div className={styles.copy}>
          <p className={styles.headline}>{line1}</p>
          <p className={styles.subline}>{line2}</p>
          <p className={styles.hint}>{t("loading.hint")}</p>
        </div>
      </div>
    </div>
  );
});

LoadingModal.displayName = "LoadingModal";

export default LoadingModal;
