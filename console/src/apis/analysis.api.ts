import type { AnalyzeTLSRequest } from "@/types";
import type { AnalyzeTLSResponse } from "@/types";
import { protectedClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

export const AnalyzeTLS = async (params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse> => {
  const { data } = await protectedClient.post<AnalyzeTLSResponse>(URL_PATHS.ANALYSIS.tls, {
    certificate: params.certificate,
    private_key: params.privateKey,
  });
  return data;
};
