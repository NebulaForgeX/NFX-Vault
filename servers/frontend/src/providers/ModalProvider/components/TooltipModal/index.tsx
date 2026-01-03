import { memo, useEffect, useRef, useCallback } from "react";
import { AlertTriangle } from "@/assets/icons/lucide";
import { useTranslation } from "node_modules/react-i18next";
import ModalStore, { useModalStore } from "@/stores/modalStore";
import styles from "./Modal.module.css";

const TooltipModal = memo(() => {
  const { t } = useTranslation("certificateElements");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = useModalStore((state) => state.tooltipModal.isOpen);
  const message = useModalStore((state) => state.tooltipModal.message);
  const errorTime = useModalStore((state) => state.tooltipModal.errorTime);
  const position = useModalStore((state) => state.tooltipModal.position);
  const hideModal = ModalStore.getState().hideModal;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && position && dialogRef.current) {
      const dialog = dialogRef.current;
      // 等待 dialog 打开后再计算位置
      const updatePosition = () => {
        if (!dialog.open) return;
        
        const { x, y } = position;
        const dialogRect = dialog.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = y + 8; // 默认在下方
        let left = x;

        // 确保 tooltip 不会超出视口
        if (left + dialogRect.width > viewportWidth) {
          left = viewportWidth - dialogRect.width - 8;
        }
        if (left < 0) {
          left = 8;
        }

        if (top + dialogRect.height > viewportHeight) {
          top = y - dialogRect.height - 8; // 改为在上方
        }
        if (top < 0) {
          top = 8;
        }

        dialog.style.top = `${top}px`;
        dialog.style.left = `${left}px`;
      };

      // 使用 requestAnimationFrame 确保 DOM 已更新
      requestAnimationFrame(() => {
        requestAnimationFrame(updatePosition);
      });
    }
  }, [isOpen, position]);

  const handleClose = useCallback(() => {
    hideModal("tooltip");
  }, [hideModal]);

  if (!isOpen || !message) {
    return null;
  }

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={handleClose}>
      <div className={styles.content}>
        <div className={styles.header}>
          <AlertTriangle size={20} className={styles.icon} />
          <h3 className={styles.title}>{t("error.lastError") || "Last Error"}</h3>
        </div>
        <p className={styles.message}>{message}</p>
        {errorTime && (
          <p className={styles.time}>
            {t("error.errorTime") || "Error Time"}: {new Date(errorTime).toLocaleString()}
          </p>
        )}
      </div>
    </dialog>
  );
});

TooltipModal.displayName = "TooltipModal";

export default TooltipModal;

