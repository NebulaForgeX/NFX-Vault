import type { AnalyzeTLSRequest, AnalyzeTLSResponse } from "@/types";

import { AnalyzeTLS } from "@/apis/analysis.api";

export interface AnalysisRepository {
  AnalyzeTLS(params: AnalyzeTLSRequest): Promise<AnalyzeTLSResponse>;
}

export class ApiAnalysisRepository implements AnalysisRepository {
  AnalyzeTLS = AnalyzeTLS;
}
