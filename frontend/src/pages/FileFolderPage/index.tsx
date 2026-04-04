import { memo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { safeOr, safeStringable } from "nfx-ui/utils";

import { BackButton } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import { ListDirectory, downloadFile, DeleteFileOrFolder } from "@/apis/file.api";
import type { FileItem } from "@/types";
import { ModalStore } from "@/stores/modalStore";
import { FolderItem, FileItem as FileItemComponent } from "./components";
import styles from "./styles.module.css";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";

const STORE = "websites" as const;

const FileFolderPage = memo(() => {
  const [searchParams] = useSearchParams();
  const pathParam = safeStringable(searchParams.get("path"));

  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    const loadDirectory = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ListDirectory(pathParam || undefined);
        if (result && result.success) {
          setItems(Array.isArray(result.items) ? result.items : []);
          if (result.path) {
            setCurrentPath(result.path.split("/").filter(Boolean));
          } else {
            setCurrentPath([]);
          }
        } else {
          const errorMsg = result?.message || "Failed to load directory";
          setError(errorMsg);
        }
      } catch (err: unknown) {
        console.error("Failed to load directory:", err);
        const e = err as { response?: { data?: { detail?: string; message?: string } }; message?: string };
        const errorMsg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Failed to load directory";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, [pathParam]);

  const handleBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1).join("/");
      routerEventEmitter.navigate({
        to: `${ROUTES.FILE_FOLDER}${newPath ? `?path=${encodeURIComponent(newPath)}` : ""}`,
      });
    } else {
      routerEventEmitter.navigateBack();
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "directory") {
      routerEventEmitter.navigate({ to: `${ROUTES.FILE_FOLDER}?path=${encodeURIComponent(item.path)}` });
    } else if (item.type === "file") {
      ModalStore.getState().showFileModal({
        isOpen: true,
        store: STORE,
        filePath: item.path,
        fileName: item.name,
        folderName: safeOr(item.path.split("/").slice(0, -1).pop(), ""),
      });
    }
  };

  const handleDownload = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type !== "file") return;
    try {
      const pathParts = item.path.split("/").filter(Boolean);
      pathParts.pop();
      const folderLevels = pathParts.join("_");
      const downloadFolderName = folderLevels || "";
      await downloadFile(item.path, downloadFolderName);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const handleDelete = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();

    const itemType = item.type === "directory" ? "folder" : "file";
    const itemName = itemType === "folder" ? "folder" : "file";

    showConfirm({
      title: `Delete ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`,
      message: `Are you sure you want to delete the ${itemName} "${item.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await DeleteFileOrFolder({
            store: STORE,
            path: item.path,
            item_type: itemType,
          });

          if (result.success) {
            showSuccess(result.message || `Successfully deleted ${itemName}`);
            const reload = async () => {
              setLoading(true);
              setError(null);
              try {
                const r = await ListDirectory(pathParam || undefined);
                if (r && r.success) {
                  setItems(Array.isArray(r.items) ? r.items : []);
                  if (r.path) {
                    setCurrentPath(r.path.split("/").filter(Boolean));
                  } else {
                    setCurrentPath([]);
                  }
                }
              } catch (err: unknown) {
                const ex = err as { message?: string };
                setError(ex?.message || "Failed to reload directory");
              } finally {
                setLoading(false);
              }
            };
            await reload();
          } else {
            showError(result.message || `Failed to delete ${itemName}`);
          }
        } catch (error: unknown) {
          const ex = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
          showError(
            ex?.response?.data?.detail ||
              ex?.response?.data?.message ||
              ex?.message ||
              `Failed to delete ${itemName}`,
          );
        }
      },
    });
  };

  const storeName = "Websites";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} className={styles.backBtn} />
        <div>
          <h1 className={styles.title}>{storeName}</h1>
          {currentPath.length > 0 && <p className={styles.subtitle}>{currentPath.join(" / ")}</p>}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>Directory is empty</div>
        ) : (
          <div className={styles.fileList}>
            {items.map((item) => {
              if (item.type === "directory") {
                return (
                  <FolderItem key={item.path} item={item} onClick={handleItemClick} onDelete={handleDelete} />
                );
              }
              return (
                <FileItemComponent
                  key={item.path}
                  item={item}
                  onClick={handleItemClick}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

FileFolderPage.displayName = "FileFolderPage";

export default FileFolderPage;