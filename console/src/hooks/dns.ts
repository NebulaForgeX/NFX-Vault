import type { AxiosError } from "axios";
import type { NormalUnifiedQueryOptions } from "nfx-ui/hooks";
import type {
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

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError, showSuccess } from "nfx-ui/stores";

import { useDnsRepository } from "@/apis/repositories";
import { DNS_CREDENTIAL, DNS_DDNS_HOSTS, DNS_DOMAIN_LIST, DNS_HOSTS, DNS_OUTBOUND_IP } from "@/constants";
import { DnsAUpdateMethod } from "@/enums";
import { dnsEventEmitter } from "@/events/dns";

export const useNamecheapCredential = (options?: NormalUnifiedQueryOptions<NamecheapCredential | null>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(() => dns.GetNamecheapCredential(), DNS_CREDENTIAL(), {}, options);
};

export const useDnsOutboundIp = (options?: NormalUnifiedQueryOptions<DnsOutboundIp>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(() => dns.GetDnsOutboundIp(), DNS_OUTBOUND_IP(), {}, options);
};

export const useNamecheapDomains = (enabled: boolean, options?: NormalUnifiedQueryOptions<{ items: NamecheapDomain[] }>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery(() => dns.ListNamecheapDomains(), DNS_DOMAIN_LIST, {}, { enabled, ...options });
};

export const useNamecheapHosts = (domain: string, options?: NormalUnifiedQueryOptions<NamecheapHostsResult>) => {
  const dns = useDnsRepository();
  return useUnifiedQuery((p: { domain: string }) => dns.GetNamecheapHosts(p.domain), DNS_HOSTS(domain), { domain }, { enabled: Boolean(domain), ...options });
};

export const useNamecheapDdnsHosts = (domain?: string, options?: NormalUnifiedQueryOptions<{ items: NamecheapDdnsHost[] }>) => {
  const dns = useDnsRepository();
  const key = domain ?? "all";
  return useUnifiedQuery((p: { domain?: string }) => dns.ListNamecheapDdnsHosts(p.domain), DNS_DDNS_HOSTS(key), { domain }, options);
};

export const useUpsertNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (request: UpsertNamecheapCredentialRequest) => dns.UpsertNamecheapCredential(request),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpsertNamecheapCredential]")),
  });
};

export const useVerifyNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: () => dns.VerifyNamecheapCredential(),
    onSuccess: (data) => {
      if (data.success) showSuccess(data.message);
      else showError(data.message);
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useVerifyNamecheapCredential]")),
  });
};

export const useDeleteNamecheapCredential = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: () => dns.DeleteNamecheapCredential(),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteNamecheapCredential]")),
  });
};

export const useUpsertNamecheapDdnsHost = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (request: UpsertNamecheapDdnsHostRequest) => dns.UpsertNamecheapDdnsHost(request),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpsertNamecheapDdnsHost]")),
  });
};

export const useDeleteNamecheapDdnsHost = () => {
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (id: string) => dns.DeleteNamecheapDdnsHost({ id }),
    onSuccess: () => dnsEventEmitter.invalidateDns(),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteNamecheapDdnsHost]")),
  });
};

export const useUpdateDnsARecords = () => {
  const { t } = useTranslation("dnsDomain");
  const dns = useDnsRepository();
  return useMutation({
    mutationFn: (request: UpdateDnsARecordsRequest) => dns.UpdateDnsARecords(request),
    onSuccess: (data: DnsUpdateARecordsResult) => {
      const detail =
        data.items.length > 0
          ? data.items
              .map((item) => {
                const methodLabel = item.method ? t(`aResult.method.${DnsAUpdateMethod(item.method)}`) : item.method;
                return t("aResult.item", {
                  host: item.host,
                  domain: item.domain,
                  method: methodLabel,
                  message: item.message,
                });
              })
              .join("\n")
          : data.message;
      if (data.success) showSuccess(detail);
      else showError(detail);
      dnsEventEmitter.invalidateDns();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateDnsARecords]")),
  });
};
