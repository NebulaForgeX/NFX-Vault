import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TruckLoading } from "@/components";
import { useModalStore } from "@/stores/modalStore";
import styles from "./styles.module.css";

const LoadingModal = memo(() => {
  const { t } = useTranslation("cert");
  const isOpen = useModalStore((state) => state.loadingModal.isOpen);
  const title = useModalStore((state) => state.loadingModal.title);
  const message = useModalStore((state) => state.loadingModal.message);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <TruckLoading size="large" />
          {title && <h3 className={styles.title}>{title}</h3>}
          <p className={styles.message}>
            {message || t("apply.applying") || "正在申请证书，请稍候..."}
          </p>
        </div>
      </div>
    </div>
  );
});

LoadingModal.displayName = "LoadingModal";

export default LoadingModal;

