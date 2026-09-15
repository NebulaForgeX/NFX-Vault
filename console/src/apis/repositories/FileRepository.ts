import type { FileListResponse } from "@/types";

import {
  DeleteFileOrFolder,
  downloadFile,
  ExportCertificates,
  ExportSingleCertificate,
  GetFileContent,
  ListDirectory,
  type DeleteFileOrFolderRequest,
  type DeleteFileOrFolderResponse,
  type ExportSingleCertificateParams,
  type ExportSingleCertificateResponse,
  type FileContentResponse,
} from "@/apis/file.api";

export type { DeleteFileOrFolderRequest, DeleteFileOrFolderResponse, ExportSingleCertificateParams, ExportSingleCertificateResponse, FileContentResponse };

export interface FileRepository {
  ListDirectory(path?: string): Promise<FileListResponse>;
  ExportCertificates(): Promise<{ success: boolean; message: string }>;
  ExportSingleCertificate(params: ExportSingleCertificateParams): Promise<ExportSingleCertificateResponse>;
  downloadFile(filePath: string, folderName: string): Promise<void>;
  GetFileContent(filePath: string): Promise<FileContentResponse>;
  DeleteFileOrFolder(request: DeleteFileOrFolderRequest): Promise<DeleteFileOrFolderResponse>;
}

export class ApiFileRepository implements FileRepository {
  ListDirectory = ListDirectory;
  ExportCertificates = ExportCertificates;
  ExportSingleCertificate = ExportSingleCertificate;
  downloadFile = downloadFile;
  GetFileContent = GetFileContent;
  DeleteFileOrFolder = DeleteFileOrFolder;
}
