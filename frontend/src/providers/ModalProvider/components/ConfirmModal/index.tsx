import { memo, useEffect, useRef, useCallback, useState } from "react";

import { Button } from "nfx-ui/components";
import { AlertCircle } from "@/assets/icons/lucide";

import ModalStore, { useModalStore } from "@/stores/modalStore";

import styles from "./Modal.module.css";

const ConfirmModal = memo(() => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = useModalStore((state) => state.confirmModal.isOpen);
  const type = useModalStore((state) => state.modalType);
  const title = useModalStore((state) => state.confirmModal.title);
  const message = useModalStore((state) => state.confirmModal.message);
  const confirmText = useModalStore((state) => state.confirmModal.confirmText);
  const cancelText = useModalStore((state) => state.confirmModal.cancelText);
  const forceRenewalOption = useModalStore((state) => state.confirmModal.forceRenewalOption);
  const hideModal = ModalStore.getState().hideModal;
  const onCancel = ModalStore.getState().confirmModal.onCancel;

  const [forceRenewalChecked, setForceRenewalChecked] = useState(false);

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
    if (isOpen) {
      setForceRenewalChecked(forceRenewalOption?.defaultChecked ?? false);
    }
  }, [isOpen, forceRenewalOption?.defaultChecked, forceRenewalOption?.label]);

  const handleClose = useCallback(() => {
    hideModal("confirm");
  }, [hideModal]);

  const handleConfirm = useCallback(() => {
    const { onConfirm, forceRenewalOption: frOpt } = ModalStore.getState().confirmModal;
    if (frOpt) {
      onConfirm?.({ forceRenewal: forceRenewalChecked });
    } else {
      onConfirm?.();
    }
    hideModal("confirm");
  }, [forceRenewalChecked, hideModal]);

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
    hideModal("confirm");
  }, [onCancel, hideModal]);

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={handleClose}>
      <div className={`${styles.content} ${styles[type]}`}>
        <div className={styles.icon}>
          <AlertCircle size={32} />
        </div>
        {title && <h3 className={styles.title}>{title}</h3>}
        <p className={styles.message}>{message || "No message"}</p>
        {forceRenewalOption ? (
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={forceRenewalChecked}
              onChange={(e) => setForceRenewalChecked(e.target.checked)}
            />
            <span>{forceRenewalOption.label}</span>
          </label>
        ) : null}
        <div className={styles.buttonGroup}>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {cancelText || "Cancel"}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm}>
            {confirmText || "Confirm"}
          </Button>
        </div>
      </div>
    </dialog>
  );
});

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;
