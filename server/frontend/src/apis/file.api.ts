import type { FileListResponse } from "@/apis/domain";
import type { CertType } from "@/types";
import { publicClient } from "@/apis/clients";

const baseUrl = "/file";

export const ListDirectory = async (store: "apis" | "websites", path?: string): Promise<FileListResponse> => {
  const { data } = await publicClient.get<FileListResponse>(`${baseUrl}/list/${store}`, {
    params: path ? { path } : undefined,
  });
  return data;
};

export const ExportCertificates = async (params: { store: CertType }): Promise<{ success: boolean; message: string }> => {
  const { data } = await publicClient.post<{ success: boolean; message: string }>(`${baseUrl}/export/${params.store}`);
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
  const { data } = await publicClient.post<ExportSingleCertificateResponse>(`${baseUrl}/export-single`, params);
  return data;
};

export const downloadFile = async (store: "apis" | "websites", filePath: string, folderName: string): Promise<void> => {
  // 获取基础 URL
  const baseURL = publicClient.defaults.baseURL || window.location.origin;
  
  // 构建下载 URL
  const downloadUrl = `${baseURL}${baseUrl}/download/${store}?path=${encodeURIComponent(filePath)}`;
  
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
  const { data } = await publicClient.get<FileContentResponse>(`${baseUrl}/content/${store}`, {
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
  const { data } = await publicClient.delete<DeleteFileOrFolderResponse>(`${baseUrl}/delete`, {
    data: request,
  });
  return data;
};
