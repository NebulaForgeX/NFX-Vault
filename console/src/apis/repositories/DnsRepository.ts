import type {
  DeleteNamecheapDdnsHostRequest,
  DnsCommandResult,
  DnsOutboundIp,
  DnsUpdateARecordsResult,
  NamecheapCredential,
  NamecheapDdnsHost,
  NamecheapDomain,
  NamecheapHostsResult,
  UpdateDnsARecordsRequest,
  UpsertNamecheapCredentialRequest,
  UpsertNamecheapDdnsHostRequest,
} from "@/types";

import {
  DeleteNamecheapCredential,
  DeleteNamecheapDdnsHost,
  GetDnsOutboundIp,
  GetErrorTranslations,
  GetNamecheapCredential,
  GetNamecheapHosts,
  ListNamecheapDdnsHosts,
  ListNamecheapDomains,
  UpdateDnsARecords,
  UpsertNamecheapCredential,
  UpsertNamecheapDdnsHost,
  VerifyNamecheapCredential,
} from "@/apis/dns.api";

export interface DnsRepository {
  GetNamecheapCredential(): Promise<NamecheapCredential | null>;
  UpsertNamecheapCredential(request: UpsertNamecheapCredentialRequest): Promise<NamecheapCredential>;
  DeleteNamecheapCredential(): Promise<DnsCommandResult>;
  VerifyNamecheapCredential(): Promise<DnsCommandResult>;
  ListNamecheapDomains(): Promise<{ items: NamecheapDomain[] }>;
  GetNamecheapHosts(domain: string): Promise<NamecheapHostsResult>;
  ListNamecheapDdnsHosts(domain?: string): Promise<{ items: NamecheapDdnsHost[] }>;
  UpsertNamecheapDdnsHost(request: UpsertNamecheapDdnsHostRequest): Promise<NamecheapDdnsHost>;
  DeleteNamecheapDdnsHost(request: DeleteNamecheapDdnsHostRequest): Promise<DnsCommandResult>;
  UpdateDnsARecords(request: UpdateDnsARecordsRequest): Promise<DnsUpdateARecordsResult>;
  GetDnsOutboundIp(): Promise<DnsOutboundIp>;
  GetErrorTranslations(lang: string): Promise<Record<string, unknown>>;
}

export class ApiDnsRepository implements DnsRepository {
  GetNamecheapCredential = GetNamecheapCredential;
  UpsertNamecheapCredential = UpsertNamecheapCredential;
  DeleteNamecheapCredential = DeleteNamecheapCredential;
  VerifyNamecheapCredential = VerifyNamecheapCredential;
  ListNamecheapDomains = ListNamecheapDomains;
  GetNamecheapHosts = GetNamecheapHosts;
  ListNamecheapDdnsHosts = ListNamecheapDdnsHosts;
  UpsertNamecheapDdnsHost = UpsertNamecheapDdnsHost;
  DeleteNamecheapDdnsHost = DeleteNamecheapDdnsHost;
  UpdateDnsARecords = UpdateDnsARecords;
  GetDnsOutboundIp = GetDnsOutboundIp;
  GetErrorTranslations = GetErrorTranslations;
}
