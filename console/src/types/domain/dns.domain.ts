/**
 * Namecheap DNS domain types — camelCase after axios-case-converter.
 */

import type { DnsAUpdateMethodEnum } from "@/enums";

export interface NamecheapCredential {
  id: string;
  accountId: string;
  profileId?: string;
  apiUser: string;
  userName: string;
  clientIp: string;
  sandbox: boolean;
  hasApiKey: boolean;
  lastVerifiedAt?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NamecheapDomain {
  id: string;
  name: string;
  created?: string;
  expires?: string;
  isExpired?: string;
  isLocked?: string;
  autoRenew?: string;
  isOurDns?: string;
}

export interface NamecheapHost {
  hostId?: string;
  name: string;
  type: string;
  address: string;
  mxPref?: string;
  ttl?: string;
  associatedAppTitle?: string;
  friendlyName?: string;
  isActive?: string;
  isDdnsEnabled?: string;
}

export interface NamecheapHostsResult {
  domain: string;
  emailType?: string;
  isOurDns: boolean;
  hosts: NamecheapHost[];
}

export interface NamecheapDdnsHost {
  id: string;
  accountId: string;
  profileId?: string;
  credentialId?: string;
  domain: string;
  host: string;
  hasDdnsPassword: boolean;
  lastIpv4?: string;
  lastSyncedAt?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DnsCommandResult {
  success: boolean;
  message: string;
}

export interface DnsARecordItem {
  domain: string;
  host: string;
}

export interface DnsARecordResult {
  domain: string;
  host: string;
  method: DnsAUpdateMethodEnum;
  success: boolean;
  message: string;
}


export interface DnsUpdateARecordsResult {
  success: boolean;
  message: string;
  ip: string;
  items: DnsARecordResult[];
}

export interface DnsOutboundIp {
  ipv4: string;
}
