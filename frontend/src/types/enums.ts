/**
 * NFX-Vault 全局枚举 — 与后端证书 store / source / status 约定对齐。
 * Global enums aligned with Vault backend certificate conventions (see Pqttec-Admin `types/enums.ts` pattern).
 */

/** 证书存储分区（与路由、后端 store 名一致） */
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
