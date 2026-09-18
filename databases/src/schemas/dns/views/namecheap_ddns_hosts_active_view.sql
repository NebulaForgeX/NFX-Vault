CREATE OR REPLACE VIEW "dns"."NamecheapDdnsHostsActiveView" AS
SELECT
  "id", "account_id", "profile_id", "credential_id", "domain", "host",
  "ddns_password", "last_ipv4", "last_synced_at", "last_error_message",
  "created_at", "updated_at"
FROM "dns"."namecheap_ddns_hosts";

COMMENT ON VIEW "dns"."NamecheapDdnsHostsActiveView" IS 'Namecheap Dynamic DNS host rows for list/detail reads.';
