import { memo, useEffect, useState } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { ArrowLeft, Server } from "lucide-react";
import { PageFrame } from "@/layouts";
import { EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { NamecheapHostTypeEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import { useDeleteNamecheapDdnsHost, useDnsOutboundIp, useNamecheapDdnsHosts, useNamecheapHosts, useUpdateDnsARecords, useUpsertNamecheapDdnsHost } from "@/hooks/dns";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";

import styles from "../DnsPage/styles.module.css";

const DnsDomainPage = memo(() => {
  const { t } = useTranslation("dnsDomain");
  const { domain = "" } = useParams();
  const hostsQuery = useNamecheapHosts(domain);
  const ddnsQuery = useNamecheapDdnsHosts(domain);
  const outboundQuery = useDnsOutboundIp();
  const upsertDdns = useUpsertNamecheapDdnsHost();
  const deleteDdns = useDeleteNamecheapDdnsHost();
  const updateA = useUpdateDnsARecords();
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [ips, setIps] = useState<Record<string, string>>({});

  const hosts = hostsQuery.data?.hosts ?? [];
  const ddnsByHost = new Map((ddnsQuery.data?.items ?? []).map((row) => [row.host, row]));
  const outboundIp = outboundQuery.data?.ipv4 ?? "";

  useEffect(() => {
    if (!outboundIp) return;
    const rows = hostsQuery.data?.hosts ?? [];
    if (rows.length === 0) return;
    setIps((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const host of rows) {
        if (host.type === NamecheapHostTypeEnum.A && !next[host.name]) {
          next[host.name] = outboundIp;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [outboundIp, hostsQuery.data?.hosts]);

  const saveDdns = (hostName: string) => {
    const saved = ddnsByHost.get(hostName);
    const password = passwords[hostName] ?? "";
    if (!saved?.hasDdnsPassword && !password.trim()) {
      showError(t("ddnsPasswordRequired"));
      return;
    }
    void upsertDdns
      .mutateAsync({ domain, host: hostName, ddnsPassword: password })
      .then(() => {
        showSuccess(t("ddnsSaved"));
        setPasswords((prev) => ({ ...prev, [hostName]: "" }));
      });
  };

  const confirmRemoveDdns = (id: string, hostName: string) => {
    showConfirm({
      title: t("confirmDeleteTitle"),
      message: t("confirmDeleteMessage", { host: hostName }),
      confirmText: t("removeDdns"),
      cancelText: t("cancel"),
      onConfirm: () => {
        void deleteDdns.mutateAsync(id);
      },
    });
  };

  const hostBody = (() => {
    if (hostsQuery.isLoading) {
      return <EmptyState icon={Server} title={t("loading")} />;
    }
    if (hostsQuery.isError) {
      return <EmptyState icon={Server} title={t("loadError")} />;
    }
    if (hosts.length === 0) {
      return <EmptyState icon={Server} title={t("empty")} />;
    }
    return (
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>{t("host")}</th>
              <th>{t("type")}</th>
              <th>{t("address")}</th>
              <th>{t("ttl")}</th>
              <th>{t("mxPref")}</th>
              <th>{t("active")}</th>
              <th>{t("ddnsEnabled")}</th>
              <th>{t("associatedApp")}</th>
              <th>{t("friendlyName")}</th>
              <th>{t("ddns")}</th>
              <th>{t("newIp")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {hosts.map((host) => {
              const saved = ddnsByHost.get(host.name);
              const canUpdateA = host.type === NamecheapHostTypeEnum.A;
              return (
                <tr key={`${host.name}-${host.type}-${host.hostId ?? host.address}`}>
                  <td>{host.name}</td>
                  <td>{host.type}</td>
                  <td>{host.address}</td>
                  <td>{host.ttl ?? "—"}</td>
                  <td>{host.mxPref || "—"}</td>
                  <td>{host.isActive || "—"}</td>
                  <td>{host.isDdnsEnabled || "—"}</td>
                  <td>{host.associatedAppTitle || "—"}</td>
                  <td>{host.friendlyName || "—"}</td>
                  <td>
                    <Flex direction="column" gap="1">
                      <Flex gap="2" align="center">
                        <TextField.Root
                          type="password"
                          size="1"
                          value={passwords[host.name] ?? ""}
                          placeholder={saved?.hasDdnsPassword ? t("ddnsKeep") : t("ddnsPassword")}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, [host.name]: e.target.value }))}
                        />
                        <Button size="1" variant="soft" disabled={upsertDdns.isPending} onClick={() => saveDdns(host.name)}>
                          {t("saveDdns")}
                        </Button>
                        {saved ? (
                          <Button size="1" color="red" variant="soft" onClick={() => confirmRemoveDdns(saved.id, host.name)}>
                            {t("removeDdns")}
                          </Button>
                        ) : null}
                      </Flex>
                      {saved?.lastIpv4 ? <Text className={styles.hint}>{t("ddnsLastIp", { ip: saved.lastIpv4 })}</Text> : null}
                      {saved?.lastSyncedAt ? <Text className={styles.hint}>{t("ddnsLastSynced", { at: saved.lastSyncedAt })}</Text> : null}
                      {saved?.lastErrorMessage ? <Text className={styles.rowErr}>{saved.lastErrorMessage}</Text> : null}
                    </Flex>
                  </td>
                  <td>
                    {canUpdateA ? (
                      <TextField.Root size="1" value={ips[host.name] ?? ""} onChange={(e) => setIps((prev) => ({ ...prev, [host.name]: e.target.value }))} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {canUpdateA ? (
                      <Button
                        size="1"
                        disabled={updateA.isPending}
                        onClick={() => void updateA.mutateAsync({ ip: ips[host.name] ?? "", items: [{ domain, host: host.name }] })}
                      >
                        {t("updateA")}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  })();

  return (
    <PageFrame>
      <PageHeader
        icon={Server}
        title={domain}
        description={t("subtitle")}
        actions={
          <Button variant="soft" onClick={() => routerEventEmitter.navigateBack()}>
            <ArrowLeft size={16} />
            {t("back")}
          </Button>
        }
      />
      <Flex direction="column" gap="4" width="100%">
        {hostsQuery.data ? (
          <Text className={styles.hint}>
            {t("emailType", { type: hostsQuery.data.emailType || "—" })} · {t("ourDns", { value: String(hostsQuery.data.isOurDns) })}
          </Text>
        ) : null}
        {hostBody}
      </Flex>
    </PageFrame>
  );
});

DnsDomainPage.displayName = "DnsDomainPage";

export default DnsDomainPage;
