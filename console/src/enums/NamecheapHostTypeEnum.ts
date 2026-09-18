/**
 * Namecheap host record type — closed set from getHosts / setHosts.
 */
import { safeEnum } from "nfx-ui/utils";

export enum NamecheapHostTypeEnum {
  A = "A",
  AAAA = "AAAA",
  CNAME = "CNAME",
  MX = "MX",
  MXE = "MXE",
  TXT = "TXT",
  URL = "URL",
  URL301 = "URL301",
  FRAME = "FRAME",
  NS = "NS",
  SRV = "SRV",
  CAA = "CAA",
  ALIAS = "ALIAS",
}

export const DEFAULT_NAMECHEAP_HOST_TYPE = NamecheapHostTypeEnum.A;
export const NAMECHEAP_HOST_TYPE_VALUES = Object.values(NamecheapHostTypeEnum);
export const NamecheapHostType = (value: string | null | undefined) =>
  safeEnum(value, NAMECHEAP_HOST_TYPE_VALUES, DEFAULT_NAMECHEAP_HOST_TYPE);
