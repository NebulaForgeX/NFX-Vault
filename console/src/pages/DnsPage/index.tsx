import { memo, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Flex, Text, TextField } from "@radix-ui/themes";
import { Server } from "lucide-react";
import { PageFrame } from "@/layouts";
import { EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";

import {
  useDeleteNamecheapCredential,
  useDnsOutboundIp,
  useNamecheapCredential,
  useNamecheapDomains,
  useUpdateDnsARecords,
  useUpsertNamecheapCredential,
  useVerifyNamecheapCredential,
} from "@/hooks/dns";
import { ROUTES } from "@/navigations";

import styles from "./styles.module.css";

const DnsPage = memo(() => {
  const { t } = useTranslation("dns");
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential();
  const outboundQuery = useDnsOutboundIp();
  const credential = credentialQuery.data ?? null;
  const hasCredential = Boolean(credential?.hasApiKey);
  const domainsQuery = useNamecheapDomains(hasCredential);
  const upsert = useUpsertNamecheapCredential();
  const verify = useVerifyNamecheapCredential();
  const remove = useDeleteNamecheapCredential();
  const updateA = useUpdateDnsARecords();

  const [apiUser, setApiUser] = useState("");
  const [userName, setUserName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [clientIp, setClientIp] = useState("");
  const [sandbox, setSandbox] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkIp, setBulkIp] = useState("");
  const [bulkHost, setBulkHost] = useState("@");

  useEffect(() => {
    if (!credential) return;
    setApiUser(credential.apiUser);
    setUserName(credential.userName);
    setClientIp(credential.clientIp);
    setSandbox(credential.sandbox);
  }, [credential]);

  useEffect(() => {
    const ip = outboundQuery.data?.ipv4;
    if (!ip) return;
    setBulkIp((prev) => prev || ip);
  }, [outboundQuery.data?.ipv4]);

  const domains = domainsQuery.data?.items ?? [];
  const selectedNames = useMemo(() => Object.keys(selected).filter((name) => selected[name]), [selected]);

  const saveCredential = async () => {
    const row = await upsert.mutateAsync({
      apiUser,
      userName: userName || apiUser,
      apiKey: apiKey || undefined,
      clientIp,
      sandbox,
    });
    if (row) {
      showSuccess(t("credential.saved"));
      setApiKey("");
    }
  };

  const applyOutbound = () => {
    const ip = outboundQuery.data?.ipv4;
    if (!ip) return;
    setClientIp(ip);
    setBulkIp(ip);
  };

  const confirmDeleteCredential = () => {
    showConfirm({
      title: t("credential.confirmDeleteTitle"),
      message: t("credential.confirmDeleteMessage"),
      confirmText: t("credential.delete"),
      cancelText: t("credential.cancel"),
      onConfirm: () => {
        void remove.mutateAsync();
      },
    });
  };

  const runBulk = async () => {
    if (selectedNames.length === 0) {
      showError(t("bulk.noneSelected"));
      return;
    }
    await updateA.mutateAsync({
      ip: bulkIp,
      items: selectedNames.map((domain) => ({ domain, host: bulkHost || "@" })),
    });
  };

  const domainBody = (() => {
    if (!hasCredential) {
      return <EmptyState icon={Server} title={t("empty.credential")} />;
    }
    if (domainsQuery.isLoading) {
      return <EmptyState icon={Server} title={t("loading")} />;
    }
    if (domainsQuery.isError) {
      return <EmptyState icon={Server} title={t("domains.loadError")} />;
    }
    if (domains.length === 0) {
      return <EmptyState icon={Server} title={t("empty.domains")} />;
    }
    return (
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th />
              <th>{t("domains.name")}</th>
              <th>{t("domains.created")}</th>
              <th>{t("domains.expires")}</th>
              <th>{t("domains.expired")}</th>
              <th>{t("domains.locked")}</th>
              <th>{t("domains.autoRenew")}</th>
              <th>{t("domains.dns")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.name}>
                <td>
                  <Checkbox checked={Boolean(selected[d.name])} onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [d.name]: v === true }))} />
                </td>
                <td>{d.name}</td>
                <td>{d.created ?? "—"}</td>
                <td>{d.expires ?? "—"}</td>
                <td>{d.isExpired ?? "—"}</td>
                <td>{d.isLocked ?? "—"}</td>
                <td>{d.autoRenew ?? "—"}</td>
                <td>{d.isOurDns ?? "—"}</td>
                <td>
                  <Button size="1" variant="soft" onClick={() => navigate(ROUTES.DNS_DOMAIN.replace(":domain", d.name))}>
                    {t("domains.open")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  })();

  return (
    <PageFrame>
      <PageHeader icon={Server} title={t("title")} description={t("subtitle")} />
      <Flex direction="column" gap="6" width="100%">
        <section className={styles.section}>
          <Text size="4" weight="bold">
            {t("credential.title")}
          </Text>
          {credentialQuery.isLoading ? <EmptyState icon={Server} title={t("loading")} /> : null}
          {credentialQuery.isError ? <EmptyState icon={Server} title={t("empty.credential")} /> : null}
          {!credentialQuery.isLoading && !hasCredential ? <Text className={styles.hint}>{t("empty.credential")}</Text> : null}
          <Text className={styles.hint}>{t("credential.hint", { ip: outboundQuery.data?.ipv4 ?? "—" })}</Text>
          <div className={styles.grid}>
            <label className={styles.label}>
              {t("credential.apiUser")}
              <TextField.Root value={apiUser} onChange={(e) => setApiUser(e.target.value)} autoComplete="off" />
            </label>
            <label className={styles.label}>
              {t("credential.userName")}
              <TextField.Root value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="off" />
            </label>
            <label className={styles.label}>
              {t("credential.apiKey")}
              <TextField.Root type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={credential?.hasApiKey ? t("credential.apiKeyKeep") : ""} autoComplete="new-password" />
            </label>
            <label className={styles.label}>
              {t("credential.clientIp")}
              <TextField.Root value={clientIp} onChange={(e) => setClientIp(e.target.value)} />
            </label>
          </div>
          <div className={styles.actions}>
            <label className={styles.actions}>
              <Checkbox checked={sandbox} onCheckedChange={(v) => setSandbox(v === true)} />
              {t("credential.sandbox")}
            </label>
            <Button variant="soft" onClick={applyOutbound} disabled={!outboundQuery.data?.ipv4}>
              {t("credential.useOutbound")}
            </Button>
            <Button onClick={() => void saveCredential()} disabled={upsert.isPending}>
              {t("credential.save")}
            </Button>
            <Button variant="soft" onClick={() => void verify.mutateAsync()} disabled={!credential || verify.isPending}>
              {t("credential.verify")}
            </Button>
            <Button color="red" variant="soft" onClick={confirmDeleteCredential} disabled={!credential || remove.isPending}>
              {t("credential.delete")}
            </Button>
          </div>
          {credential?.lastErrorMessage ? <Text className={styles.rowErr}>{credential.lastErrorMessage}</Text> : null}
          {credential?.lastVerifiedAt ? <Text className={styles.rowOk}>{t("credential.verifiedAt", { at: credential.lastVerifiedAt })}</Text> : null}
        </section>

        <section className={styles.section}>
          <Text size="4" weight="bold">
            {t("domains.title")}
          </Text>
          <div className={styles.ipRow}>
            <label className={styles.label}>
              {t("bulk.host")}
              <TextField.Root value={bulkHost} onChange={(e) => setBulkHost(e.target.value)} />
            </label>
            <label className={styles.label}>
              {t("bulk.ip")}
              <TextField.Root value={bulkIp} onChange={(e) => setBulkIp(e.target.value)} placeholder="54.123.45.67" />
            </label>
            <Button onClick={() => void runBulk()} disabled={updateA.isPending || !hasCredential}>
              {t("bulk.update")}
            </Button>
          </div>
          {domainBody}
        </section>
      </Flex>
    </PageFrame>
  );
});

DnsPage.displayName = "DnsPage";

export default DnsPage;
