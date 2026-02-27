import { memo, useState, useEffect } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { ListDirectory, downloadFile, DeleteFileOrFolder } from "@/apis/file.api";
import type { FileItem } from "@/types";
import { ModalStore } from "@/stores/modalStore";
import { FolderItem, FileItem as FileItemComponent } from "./components";
import styles from "./styles.module.css";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";

const FileFolderPage = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathParam = searchParams.get("path") || "";

  // 从路径中提取 store（更准确的方法）
  const store = location.pathname.startsWith("/filefolder/apis")
    ? "apis"
    : location.pathname.startsWith("/filefolder/websites")
    ? "websites"
    : null;

  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    if (!store || (store !== "apis" && store !== "websites")) {
      navigate(-1);
      return;
    }

    const loadDirectory = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ListDirectory(store, pathParam || undefined);
        if (result && result.success) {
          setItems(Array.isArray(result.items) ? result.items : []);
          // 构建路径面包屑
          if (result.path) {
            setCurrentPath(result.path.split("/").filter(Boolean));
          } else {
            setCurrentPath([]);
          }
        } else {
          const errorMsg = result?.message || "Failed to load directory";
          setError(errorMsg);
        }
      } catch (err: any) {
        console.error("Failed to load directory:", err);
        const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to load directory";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, [store, pathParam]);

  const handleBack = () => {
    if (currentPath.length > 0) {
      // 返回上一级目录
      const newPath = currentPath.slice(0, -1).join("/");
      navigate(`/filefolder/${store}${newPath ? `?path=${encodeURIComponent(newPath)}` : ""}`);
    } else {
      // 返回主页
      navigate(-1);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "directory") {
      // 文件夹在页面上导航显示
      navigate(`/filefolder/${store}?path=${encodeURIComponent(item.path)}`);
    } else if (item.type === "file") {
      // 文件内容打开 modal
      ModalStore.getState().showFileModal({
        isOpen: true,
        store: store!,
        filePath: item.path,
        fileName: item.name,
        folderName: item.path.split("/").slice(0, -1).pop() || "",
      });
    }
  };

  const handleDownload = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type !== "file" || !store) return;
    try {
      // 提取所有文件夹层级并拼接
      const pathParts = item.path.split("/").filter(Boolean);
      pathParts.pop(); // 移除最后一个部分（文件名）
      const folderLevels = pathParts.join("_"); // 所有父级文件夹用下划线拼接
      const downloadFolderName = folderLevels || "";
      await downloadFile(store, item.path, downloadFolderName);
    } catch (err: any) {
      console.error("Failed to download file:", err);
    }
  };

  const handleDelete = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!store) return;
    
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
            store,
            path: item.path,
            item_type: itemType,
          });
          
          if (result.success) {
            showSuccess(result.message || `Successfully deleted ${itemName}`);
            // 重新加载目录
            const loadDirectory = async () => {
              setLoading(true);
              setError(null);
              try {
                const result = await ListDirectory(store, pathParam || undefined);
                if (result && result.success) {
                  setItems(Array.isArray(result.items) ? result.items : []);
                  if (result.path) {
                    setCurrentPath(result.path.split("/").filter(Boolean));
                  } else {
                    setCurrentPath([]);
                  }
                }
              } catch (err: any) {
                console.error("Failed to reload directory:", err);
                const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to reload directory";
                setError(errorMsg);
              } finally {
                setLoading(false);
              }
            };
            loadDirectory();
          } else {
            showError(result.message || `Failed to delete ${itemName}`);
          }
        } catch (error: any) {
          console.error(`Failed to delete ${itemName}:`, error);
          showError(error?.response?.data?.detail || error?.response?.data?.message || error?.message || `Failed to delete ${itemName}`);
        }
      },
    });
  };


  if (!store) return null;

  const storeName = store === "apis" ? "Apis" : "Websites";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.title}>{storeName}</h1>
          {currentPath.length > 0 && (
            <p className={styles.subtitle}>
              {currentPath.join(" / ")}
            </p>
          )}
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
                  <FolderItem
                    key={item.path}
                    item={item}
                    onClick={handleItemClick}
                    onDelete={handleDelete}
                  />
                );
              } else {
                return (
                  <FileItemComponent
                    key={item.path}
                    item={item}
                    onClick={handleItemClick}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
});

FileFolderPage.displayName = "FileFolderPage";

export default FileFolderPage;

