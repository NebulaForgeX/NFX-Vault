// Domain Enums - 与 NFX-Identity/console types/domain/enums 结构对齐

export type CertType = "websites" | "apis" | "database";

export enum CertificateSource {
  AUTO = "auto",
  MANUAL_APPLY = "manual_apply",
  MANUAL_ADD = "manual_add",
}

export enum CertificateStatus {
  SUCCESS = "success",
  FAIL = "fail",
  PROCESS = "process",
}

export enum CertificateStore {
  WEBSITES = "websites",
  APIS = "apis",
  DATABASE = "database",
}
