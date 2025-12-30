import type { AnalyzeTLSRequest, AnalyzeTLSResponse } from "@/apis/domain";
import { publicClient } from "@/apis/clients";

const baseUrl = "/analysis";

export const AnalyzeTLS = async (params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse> => {
  const { data } = await publicClient.post<AnalyzeTLSResponse>(`${baseUrl}/tls`, {
    certificate: params.certificate,
    private_key: params.privateKey, // 请求时使用 snake_case
  });
  return data;
};

