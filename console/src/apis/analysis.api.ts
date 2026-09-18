import type { AnalyzeTLSRequest } from "@/types";
import type { AnalyzeTLSResponse } from "@/types";
import { protectedClient, publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

export const AnalyzeTLS = async (params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse> => {
  const { data } = await protectedClient.post<AnalyzeTLSResponse>(URL_PATHS.ANALYSIS.tls, params);
  return data;
};

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClient.get<Record<string, unknown>>(URL_PATHS.ANALYSIS.i18nErrors(lang));
  return data;
};
