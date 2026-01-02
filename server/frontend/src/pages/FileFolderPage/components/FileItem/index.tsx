import { memo } from "react";
import { File, Download, Trash2 } from "@/assets/icons/lucide";
import type { FileItem } from "@/apis/domain";
import styles from "./FileItem.module.css";

interface FileItemProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onDownload: (item: FileItem, e: React.MouseEvent) => void;
  onDelete: (item: FileItem, e: React.MouseEvent) => void;
}

const FileItem = memo(({ item, onClick, onDownload, onDelete }: FileItemProps) => {
  const formatSize = (bytes: number | null | undefined): string => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div
      className={styles.fileItem}
      onClick={() => onClick(item)}
    >
      <div className={styles.fileIcon}>
        <File size={24} />
      </div>
      <div className={styles.fileInfo}>
        <div className={styles.fileName}>{item.name}</div>
        <div className={styles.fileMeta}>
          <span>Size: {formatSize(item.size)}</span>
          <span>Modified: {formatDate(item.modified)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.downloadBtn}
          onClick={(e) => onDownload(item, e)}
          title="Download"
        >
          <Download size={18} />
        </button>
        <button
          className={styles.deleteBtn}
          onClick={(e) => onDelete(item, e)}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
});

FileItem.displayName = "FileItem";

export default FileItem;

