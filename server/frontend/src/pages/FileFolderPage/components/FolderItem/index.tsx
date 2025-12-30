import { memo } from "react";
import { Folder } from "@/assets/icons/lucide";
import type { FileItem } from "@/apis/domain";
import styles from "./FolderItem.module.css";

interface FolderItemProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
}

const FolderItem = memo(({ item, onClick }: FolderItemProps) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div
      className={styles.folderItem}
      onClick={() => onClick(item)}
    >
      <div className={styles.folderIcon}>
        <Folder size={24} />
      </div>
      <div className={styles.folderInfo}>
        <div className={styles.folderName}>{item.name}</div>
        <div className={styles.folderMeta}>
          <span>Modified: {formatDate(item.modified)}</span>
        </div>
      </div>
    </div>
  );
});

FolderItem.displayName = "FolderItem";

export default FolderItem;

