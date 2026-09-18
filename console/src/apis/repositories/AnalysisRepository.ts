import type { AnalyzeTLSRequest, AnalyzeTLSResponse } from "@/types";

import { AnalyzeTLS, GetErrorTranslations } from "@/apis/analysis.api";

export interface AnalysisRepository {
  AnalyzeTLS(params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse>;
  GetErrorTranslations(lang: string): Promise<Record<string, unknown>>;
}

export class ApiAnalysisRepository implements AnalysisRepository {
  AnalyzeTLS = AnalyzeTLS;
  GetErrorTranslations = GetErrorTranslations;
}
