import type { FileListResponse } from "@/types";
import type { CertType } from "@/types";
import { publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

export const ListDirectory = async (store: "apis" | "websites", path?: string): Promise<FileListResponse> => {
  const { data } = await publicClient.get<FileListResponse>(URL_PATHS.FILE.list(store), {
    params: path ? { path } : undefined,
  });
  return data;
};

export const ExportCertificates = async (params: { store: CertType }): Promise<{ success: boolean; message: string }> => {
  const { data } = await publicClient.post<{ success: boolean; message: string }>(URL_PATHS.FILE.export(params.store));
  return data;
};

export interface ExportSingleCertificateParams {
  certificate_id: string;
  store: "apis" | "websites";
}

export interface ExportSingleCertificateResponse {
  success: boolean;
  message: string;
  store?: string;
  folder_name?: string;
  domain?: string;
  certificate_id?: string;
}

export const ExportSingleCertificate = async (params: ExportSingleCertificateParams): Promise<ExportSingleCertificateResponse> => {
  const { data } = await publicClient.post<ExportSingleCertificateResponse>(URL_PATHS.FILE.exportSingle, params);
  return data;
};

export const downloadFile = async (store: "apis" | "websites", filePath: string, folderName: string): Promise<void> => {
  const baseURL = publicClient.defaults.baseURL || window.location.origin;
  const downloadUrl = `${baseURL}${URL_PATHS.FILE.download(store)}?path=${encodeURIComponent(filePath)}`;
  
  // 从路径中提取原始文件名
  const originalFileName = filePath.split("/").pop() || "file";
  const downloadFileName = folderName ? `${folderName}_${originalFileName}` : originalFileName;
  
  // 创建临时链接并触发下载
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", downloadFileName);
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export interface FileContentResponse {
  success: boolean;
  message: string;
  content?: string;
  filename?: string;
}

export const GetFileContent = async (store: "apis" | "websites", filePath: string): Promise<FileContentResponse> => {
  const { data } = await publicClient.get<FileContentResponse>(URL_PATHS.FILE.content(store), {
    params: { path: filePath },
  });
  return data;
};

export interface DeleteFileOrFolderRequest {
  store: "apis" | "websites";
  path: string;
  item_type: "file" | "folder";
}

export interface DeleteFileOrFolderResponse {
  success: boolean;
  message: string;
}

export const DeleteFileOrFolder = async (request: DeleteFileOrFolderRequest): Promise<DeleteFileOrFolderResponse> => {
  const { data } = await publicClient.delete<DeleteFileOrFolderResponse>(URL_PATHS.FILE.delete, {
    data: request,
  });
  return data;
};
