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
