import type { VaultRepositories } from "./types";

import { ApiAnalysisRepository } from "./AnalysisRepository";
import { ApiCertRepository } from "./CertRepository";
import { ApiFileRepository } from "./FileRepository";

export const vaultRepositories: VaultRepositories = {
  cert: new ApiCertRepository(),
  file: new ApiFileRepository(),
  analysis: new ApiAnalysisRepository(),
};
