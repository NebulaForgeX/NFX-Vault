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

import { protectedClient, publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

interface Envelope<T> {
  status: number;
  message: string;
  data: T;
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const { data } = await promise;
  return data.data;
}

export const GetNamecheapCredential = () =>
  unwrap<NamecheapCredential | null>(protectedClient.get(URL_PATHS.DNS.credential));

export const UpsertNamecheapCredential = (request: UpsertNamecheapCredentialRequest) =>
  unwrap<NamecheapCredential>(protectedClient.put(URL_PATHS.DNS.credential, request));

export const DeleteNamecheapCredential = () =>
  unwrap<DnsCommandResult>(protectedClient.delete(URL_PATHS.DNS.credential));

export const VerifyNamecheapCredential = () =>
  unwrap<DnsCommandResult>(protectedClient.post(URL_PATHS.DNS.credentialVerify));

export const ListNamecheapDomains = () =>
  unwrap<{ items: NamecheapDomain[] }>(protectedClient.get(URL_PATHS.DNS.domains));

export const GetNamecheapHosts = (domain: string) =>
  unwrap<NamecheapHostsResult>(protectedClient.get(URL_PATHS.DNS.hosts, { params: { domain } }));

export const ListNamecheapDdnsHosts = (domain?: string) =>
  unwrap<{ items: NamecheapDdnsHost[] }>(
    protectedClient.get(URL_PATHS.DNS.ddnsHosts, { params: domain ? { domain } : undefined }),
  );

export const UpsertNamecheapDdnsHost = (request: UpsertNamecheapDdnsHostRequest) =>
  unwrap<NamecheapDdnsHost>(protectedClient.put(URL_PATHS.DNS.ddnsHosts, request));

export const DeleteNamecheapDdnsHost = (request: DeleteNamecheapDdnsHostRequest) =>
  unwrap<DnsCommandResult>(protectedClient.delete(URL_PATHS.DNS.ddnsHosts, { data: request }));

export const UpdateDnsARecords = (request: UpdateDnsARecordsRequest) =>
  unwrap<DnsUpdateARecordsResult>(protectedClient.put(URL_PATHS.DNS.aRecords, request));

export const GetDnsOutboundIp = () => unwrap<DnsOutboundIp>(protectedClient.get(URL_PATHS.DNS.outboundIp));

export const GetErrorTranslations = async (lang: string): Promise<Record<string, unknown>> => {
  const { data } = await publicClient.get<Record<string, unknown>>(URL_PATHS.DNS.i18nErrors(lang));
  return data;
};
