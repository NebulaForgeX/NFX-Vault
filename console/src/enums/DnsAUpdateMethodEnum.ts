/**
 * A-record update path — DDNS Dynamic DNS vs Official API setHosts.
 */
import { safeEnum } from "nfx-ui/utils";

export enum DnsAUpdateMethodEnum {
  DDNS = "ddns",
  SET_HOSTS = "set_hosts",
}

export const DEFAULT_DNS_A_UPDATE_METHOD = DnsAUpdateMethodEnum.SET_HOSTS;
export const DNS_A_UPDATE_METHOD_VALUES = Object.values(DnsAUpdateMethodEnum);
export const DnsAUpdateMethod = (value: string | null | undefined) =>
  safeEnum(value, DNS_A_UPDATE_METHOD_VALUES, DEFAULT_DNS_A_UPDATE_METHOD);
