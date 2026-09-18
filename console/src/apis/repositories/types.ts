import type { AnalysisRepository } from "./AnalysisRepository";
import type { DnsRepository } from "./DnsRepository";
import type { FileRepository } from "./FileRepository";
import type { SystemRepository } from "./SystemRepository";
import type { TlsRepository } from "./TlsRepository";

export interface VaultRepositories {
  tls: TlsRepository;
  file: FileRepository;
  analysis: AnalysisRepository;
  system: SystemRepository;
  dns: DnsRepository;
}
