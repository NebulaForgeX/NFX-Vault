import { memo, useEffect, useRef, useState } from "react";
import { Button } from "nfx-ui/components";

import { X, Download } from "@/assets/icons/lucide";

import ModalStore, { useModalStore } from "@/stores/modalStore";
import { GetFileContent, downloadFile } from "@/apis/file.api";
import styles from "./Modal.module.css";

const FileModal = memo(() => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = useModalStore((state) => state.fileModal.isOpen);
  const filePath = useModalStore((state) => state.fileModal.filePath);
  const fileName = useModalStore((state) => state.fileModal.fileName);
  const hideModal = ModalStore.getState().hideModal;

  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      // 只加载文件内容
      if (filePath) {
        loadFileContent();
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();
      // 重置状态
      setFileContent("");
      setError(null);
    }
  }, [isOpen, filePath]);

  const loadFileContent = async () => {
    if (!filePath) return;
    setLoading(true);
    setError(null);
    try {
      const result = await GetFileContent(filePath);
      if (result.success && result.content) {
        setFileContent(result.content);
      } else {
        setError(result.message || "Failed to load file content");
      }
    } catch (err: any) {
      console.error("Failed to load file content:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load file content");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    hideModal("file");
  };

  const handleDownload = async () => {
    if (!filePath) return;
    try {
      const pathParts = filePath.split("/").filter(Boolean);
      pathParts.pop();
      const folderLevels = pathParts.join("_");
      const downloadFolderName = folderLevels || "";
      await downloadFile(filePath, downloadFolderName);
    } catch (err: any) {
      console.error("Failed to download file:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={handleClose}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>{fileName || "File"}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            iconOnly
            leftIcon={<X size={20} />}
            onClick={handleClose}
            className={styles.closeBtn}
            aria-label="Close"
          />
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.fileContentView}>
              <div className={styles.fileContentHeader}>
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Download size={18} />}
                  onClick={handleDownload}
                  className={styles.downloadBtn}
                  title="Download"
                >
                  Download
                </Button>
              </div>
              <pre className={styles.fileContent}>{fileContent}</pre>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
});

FileModal.displayName = "FileModal";

export default FileModal;

