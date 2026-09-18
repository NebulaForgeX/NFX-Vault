-- schema.sql
CREATE SCHEMA IF NOT EXISTS "dns";
COMMENT ON SCHEMA "dns" IS 'NFX-Vault Namecheap DNS credentials and Dynamic DNS hosts';

-- namecheap_credentials.sql
CREATE TABLE IF NOT EXISTS "dns"."namecheap_credentials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "profile_id" UUID,
  "api_user" VARCHAR(255) NOT NULL,
  "user_name" VARCHAR(255) NOT NULL,
  "api_key" TEXT NOT NULL,
  "client_ip" VARCHAR(45) NOT NULL,
  "sandbox" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_verified_at" TIMESTAMP,
  "last_error_message" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_namecheap_credentials_account_id ON "dns"."namecheap_credentials" ("account_id");

COMMENT ON TABLE "dns"."namecheap_credentials" IS 'Per-account Namecheap XML API credentials (Username + API Key + whitelisted IPv4).';
COMMENT ON COLUMN "dns"."namecheap_credentials"."api_user" IS 'Namecheap ApiUser.';
COMMENT ON COLUMN "dns"."namecheap_credentials"."user_name" IS 'Namecheap UserName; same as api_user unless a sub-user.';
COMMENT ON COLUMN "dns"."namecheap_credentials"."client_ip" IS 'IPv4 sent as ClientIp; must match Namecheap API whitelist and Vault outbound IP.';

-- namecheap_ddns_hosts.sql
CREATE TABLE IF NOT EXISTS "dns"."namecheap_ddns_hosts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "profile_id" UUID,
  "credential_id" UUID,
  "domain" VARCHAR(255) NOT NULL,
  "host" VARCHAR(255) NOT NULL,
  "ddns_password" TEXT NOT NULL,
  "last_ipv4" VARCHAR(45),
  "last_synced_at" TIMESTAMP,
  "last_error_message" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_namecheap_ddns_hosts_credential"
    FOREIGN KEY ("credential_id") REFERENCES "dns"."namecheap_credentials" ("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_namecheap_ddns_hosts_account_domain_host
  ON "dns"."namecheap_ddns_hosts" ("account_id", "domain", "host");
CREATE INDEX IF NOT EXISTS idx_namecheap_ddns_hosts_account_id
  ON "dns"."namecheap_ddns_hosts" ("account_id");

COMMENT ON TABLE "dns"."namecheap_ddns_hosts" IS 'Per-host Namecheap Dynamic DNS passwords for A-record updates.';
COMMENT ON COLUMN "dns"."namecheap_ddns_hosts"."domain" IS 'Registrable domain, e.g. lucaslyu.com.';
COMMENT ON COLUMN "dns"."namecheap_ddns_hosts"."host" IS 'DNS host label: @, www, api, etc.';

-- namecheap_credentials_active_view.sql
CREATE OR REPLACE VIEW "dns"."NamecheapCredentialsActiveView" AS
SELECT
  "id", "account_id", "profile_id", "api_user", "user_name", "api_key",
  "client_ip", "sandbox", "last_verified_at", "last_error_message",
  "created_at", "updated_at"
FROM "dns"."namecheap_credentials";

COMMENT ON VIEW "dns"."NamecheapCredentialsActiveView" IS 'Namecheap credential rows for list/detail reads.';

-- namecheap_ddns_hosts_active_view.sql
CREATE OR REPLACE VIEW "dns"."NamecheapDdnsHostsActiveView" AS
SELECT
  "id", "account_id", "profile_id", "credential_id", "domain", "host",
  "ddns_password", "last_ipv4", "last_synced_at", "last_error_message",
  "created_at", "updated_at"
FROM "dns"."namecheap_ddns_hosts";

COMMENT ON VIEW "dns"."NamecheapDdnsHostsActiveView" IS 'Namecheap Dynamic DNS host rows for list/detail reads.';
