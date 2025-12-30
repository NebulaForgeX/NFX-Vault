import type { ExportResponse } from "@/apis/domain";
import { publicClient } from "@/apis/clients";

const baseUrl = "/file";

export interface ExportCertificatesParams {
  store: string; // "websites" or "apis"
}

export const ExportCertificates = async (params: ExportCertificatesParams): Promise<ExportResponse> => {
  const { store } = params;
  const { data } = await publicClient.post<ExportResponse>(`${baseUrl}/export/${store}`);
  return data;
};

