/**
 * TLS certificate status — closed set matching backend CertificateStatus.
 */
import { safeEnum } from "nfx-ui/utils";

export enum CertificateStatusEnum {
  SUCCESS = "success",
  FAIL = "fail",
  PROCESS = "process",
}

export const DEFAULT_CERTIFICATE_STATUS = CertificateStatusEnum.PROCESS;
export const CERTIFICATE_STATUS_VALUES = Object.values(CertificateStatusEnum);
export const CertificateStatus = (value: string | null | undefined) =>
  safeEnum(value, CERTIFICATE_STATUS_VALUES, DEFAULT_CERTIFICATE_STATUS);
