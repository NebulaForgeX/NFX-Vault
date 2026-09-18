import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { Folder } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { EmptyState, PageHeader } from "nfx-ui/components";
import { useSearchParams } from "react-router";
import { safeOr, safeStringable } from "nfx-ui/utils";
import { showError, showSuccess } from "nfx-ui/stores";

import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { useDeleteFileOrFolder, useDirectoryList, useDownloadFile } from "@/hooks/file";
import type { FileItem } from "@/types";
import { FileItemTypeEnum, FileStoreEnum } from "@/enums";
import { ModalStore, showConfirm } from "@/stores/modalStore";
import { FolderItem, FileItem as FileItemComponent } from "./components";

const STORE = FileStoreEnum.WEBSITES;

const FileFolderPage = memo(() => {
  const [searchParams] = useSearchParams();
  const pathParam = safeStringable(searchParams.get("path"));
  const { data, isLoading, error: queryError } = useDirectoryList(pathParam || undefined);
  const deleteMutation = useDeleteFileOrFolder();
  const downloadMutation = useDownloadFile();

  const items = Array.isArray(data?.items) ? data.items : [];
  const currentPath = data?.path ? data.path.split("/").filter(Boolean) : [];
  const error = queryError
    ? getErrorMessage(queryError)
    : data && !data.success
      ? data.message || "Failed to load directory"
      : null;

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
      await downloadMutation.mutateAsync({ filePath: item.path, folderName: folderLevels || "" });
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const handleDelete = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();

    const itemType = item.type === "directory" ? FileItemTypeEnum.FOLDER : FileItemTypeEnum.FILE;
    const itemName = itemType === FileItemTypeEnum.FOLDER ? "folder" : "file";

    showConfirm({
      title: `Delete ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`,
      message: `Are you sure you want to delete the ${itemName} "${item.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            store: STORE,
            path: item.path,
            itemType,
          });

          if (result.success) {
            showSuccess(result.message || `Successfully deleted ${itemName}`);
          } else {
            showError(result.message || `Failed to delete ${itemName}`);
          }
        } catch (error: unknown) {
          showError(getErrorMessage(error) || `Failed to delete ${itemName}`);
        }
      },
    });
  };

  const storeName = "Websites";

  return (
    <PageFrame>
      <PageHeader
        icon={Folder}
        title={storeName}
        description={currentPath.length > 0 ? currentPath.join(" / ") : undefined}
        actions={
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
        }
      />
      {isLoading ? (
        <EmptyState icon={Folder} title="Loading..." />
      ) : error ? (
        <EmptyState icon={Folder} title={error} />
      ) : items.length === 0 ? (
        <EmptyState icon={Folder} title="Directory is empty" />
      ) : (
        <Flex direction="column" gap="2">
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
        </Flex>
      )}
    </PageFrame>
  );
});

function getErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string; message?: string } }; message?: string };
  return e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Failed to load directory";
}

FileFolderPage.displayName = "FileFolderPage";

export default FileFolderPage;
