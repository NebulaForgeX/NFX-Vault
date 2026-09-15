import type { AnalysisRepository } from "./AnalysisRepository";
import type { CertRepository } from "./CertRepository";
import type { FileRepository } from "./FileRepository";

export interface VaultRepositories {
  cert: CertRepository;
  file: FileRepository;
  analysis: AnalysisRepository;
}
