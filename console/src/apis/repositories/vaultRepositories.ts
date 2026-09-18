import type { VaultRepositories } from "./types";

import { ApiAnalysisRepository } from "./AnalysisRepository";
import { ApiDnsRepository } from "./DnsRepository";
import { ApiFileRepository } from "./FileRepository";
import { ApiSystemRepository } from "./SystemRepository";
import { ApiTlsRepository } from "./TlsRepository";

export const vaultRepositories: VaultRepositories = {
  tls: new ApiTlsRepository(),
  file: new ApiFileRepository(),
  analysis: new ApiAnalysisRepository(),
  system: new ApiSystemRepository(),
  dns: new ApiDnsRepository(),
};
