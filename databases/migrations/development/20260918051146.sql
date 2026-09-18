-- Create extension "pgcrypto"
CREATE EXTENSION "pgcrypto" WITH SCHEMA "public" VERSION "1.4";
-- Add new schema named "dns"
CREATE SCHEMA "dns";
-- Set comment to schema: "dns"
COMMENT ON SCHEMA "dns" IS 'NFX-Vault Namecheap DNS credentials and Dynamic DNS hosts';
-- Add new schema named "system"
CREATE SCHEMA "system";
-- Add new schema named "vault"
CREATE SCHEMA "vault";
-- Set comment to schema: "vault"
COMMENT ON SCHEMA "vault" IS 'NFX-Vault TLS certificates';
-- Create "namecheap_credentials" table
CREATE TABLE "dns"."namecheap_credentials" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "profile_id" uuid NULL,
  "api_user" character varying(255) NOT NULL,
  "user_name" character varying(255) NOT NULL,
  "api_key" text NOT NULL,
  "client_ip" character varying(45) NOT NULL,
  "sandbox" boolean NOT NULL DEFAULT false,
  "last_verified_at" timestamp NULL,
  "last_error_message" text NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "uq_namecheap_credentials_account_id" to table: "namecheap_credentials"
CREATE UNIQUE INDEX "uq_namecheap_credentials_account_id" ON "dns"."namecheap_credentials" ("account_id");
-- Set comment to table: "namecheap_credentials"
COMMENT ON TABLE "dns"."namecheap_credentials" IS 'Per-account Namecheap XML API credentials (Username + API Key + whitelisted IPv4).';
-- Set comment to column: "api_user" on table: "namecheap_credentials"
COMMENT ON COLUMN "dns"."namecheap_credentials"."api_user" IS 'Namecheap ApiUser.';
-- Set comment to column: "user_name" on table: "namecheap_credentials"
COMMENT ON COLUMN "dns"."namecheap_credentials"."user_name" IS 'Namecheap UserName; same as api_user unless a sub-user.';
-- Set comment to column: "client_ip" on table: "namecheap_credentials"
COMMENT ON COLUMN "dns"."namecheap_credentials"."client_ip" IS 'IPv4 sent as ClientIp; must match Namecheap API whitelist and Vault outbound IP.';
-- Create "system_state" table
CREATE TABLE "system"."system_state" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "initialized" boolean NOT NULL DEFAULT false,
  "initialized_at" timestamp NULL,
  "initialization_version" character varying(50) NULL,
  "reset_count" integer NOT NULL DEFAULT 0,
  "metadata" jsonb NULL DEFAULT '{}',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "idx_system_state_created_at" to table: "system_state"
CREATE INDEX "idx_system_state_created_at" ON "system"."system_state" ("created_at" DESC);
-- Create "tls_certificates" table
CREATE TABLE "vault"."tls_certificates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NULL,
  "profile_id" uuid NULL,
  "domain" character varying(255) NOT NULL,
  "folder_name" character varying(255) NULL,
  "status" character varying(32) NULL DEFAULT 'process',
  "email" character varying(255) NULL,
  "certificate" text NULL,
  "private_key" text NULL,
  "sans" jsonb NULL DEFAULT '[]',
  "issuer" character varying(255) NULL,
  "not_before" timestamp NULL,
  "not_after" timestamp NULL,
  "is_valid" boolean NULL DEFAULT true,
  "days_remaining" integer NULL,
  "sans_changed" boolean NOT NULL DEFAULT false,
  "last_error_message" text NULL,
  "last_error_time" timestamp NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "uq_tls_certificates_domain" to table: "tls_certificates"
CREATE UNIQUE INDEX "uq_tls_certificates_domain" ON "vault"."tls_certificates" ("domain");
-- Create "namecheap_ddns_hosts" table
CREATE TABLE "dns"."namecheap_ddns_hosts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "profile_id" uuid NULL,
  "credential_id" uuid NULL,
  "domain" character varying(255) NOT NULL,
  "host" character varying(255) NOT NULL,
  "ddns_password" text NOT NULL,
  "last_ipv4" character varying(45) NULL,
  "last_synced_at" timestamp NULL,
  "last_error_message" text NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_namecheap_ddns_hosts_credential" FOREIGN KEY ("credential_id") REFERENCES "dns"."namecheap_credentials" ("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
-- Create index "idx_namecheap_ddns_hosts_account_id" to table: "namecheap_ddns_hosts"
CREATE INDEX "idx_namecheap_ddns_hosts_account_id" ON "dns"."namecheap_ddns_hosts" ("account_id");
-- Create index "uq_namecheap_ddns_hosts_account_domain_host" to table: "namecheap_ddns_hosts"
CREATE UNIQUE INDEX "uq_namecheap_ddns_hosts_account_domain_host" ON "dns"."namecheap_ddns_hosts" ("account_id", "domain", "host");
-- Set comment to table: "namecheap_ddns_hosts"
COMMENT ON TABLE "dns"."namecheap_ddns_hosts" IS 'Per-host Namecheap Dynamic DNS passwords for A-record updates.';
-- Set comment to column: "domain" on table: "namecheap_ddns_hosts"
COMMENT ON COLUMN "dns"."namecheap_ddns_hosts"."domain" IS 'Registrable domain, e.g. lucaslyu.com.';
-- Set comment to column: "host" on table: "namecheap_ddns_hosts"
COMMENT ON COLUMN "dns"."namecheap_ddns_hosts"."host" IS 'DNS host label: @, www, api, etc.';
-- Create "NamecheapCredentialsActiveView" view
CREATE VIEW "dns"."NamecheapCredentialsActiveView" (
  "id",
  "account_id",
  "profile_id",
  "api_user",
  "user_name",
  "api_key",
  "client_ip",
  "sandbox",
  "last_verified_at",
  "last_error_message",
  "created_at",
  "updated_at"
) AS SELECT id,
    account_id,
    profile_id,
    api_user,
    user_name,
    api_key,
    client_ip,
    sandbox,
    last_verified_at,
    last_error_message,
    created_at,
    updated_at
   FROM dns.namecheap_credentials;
-- Set comment to view: "NamecheapCredentialsActiveView"
COMMENT ON VIEW "dns"."NamecheapCredentialsActiveView" IS 'Namecheap credential rows for list/detail reads.';
-- Create "NamecheapDdnsHostsActiveView" view
CREATE VIEW "dns"."NamecheapDdnsHostsActiveView" (
  "id",
  "account_id",
  "profile_id",
  "credential_id",
  "domain",
  "host",
  "ddns_password",
  "last_ipv4",
  "last_synced_at",
  "last_error_message",
  "created_at",
  "updated_at"
) AS SELECT id,
    account_id,
    profile_id,
    credential_id,
    domain,
    host,
    ddns_password,
    last_ipv4,
    last_synced_at,
    last_error_message,
    created_at,
    updated_at
   FROM dns.namecheap_ddns_hosts;
-- Set comment to view: "NamecheapDdnsHostsActiveView"
COMMENT ON VIEW "dns"."NamecheapDdnsHostsActiveView" IS 'Namecheap Dynamic DNS host rows for list/detail reads.';
-- Create "SystemStateActiveView" view
CREATE VIEW "system"."SystemStateActiveView" (
  "id",
  "initialized",
  "initialized_at",
  "initialization_version",
  "reset_count",
  "metadata",
  "created_at",
  "updated_at"
) AS SELECT id,
    initialized,
    initialized_at,
    initialization_version,
    reset_count,
    metadata,
    created_at,
    updated_at
   FROM system.system_state;
-- Set comment to view: "SystemStateActiveView"
COMMENT ON VIEW "system"."SystemStateActiveView" IS 'System bootstrap state rows.';
-- Create "TlsCertificatesActiveView" view
CREATE VIEW "vault"."TlsCertificatesActiveView" (
  "id",
  "account_id",
  "profile_id",
  "domain",
  "folder_name",
  "status",
  "email",
  "certificate",
  "private_key",
  "sans",
  "issuer",
  "not_before",
  "not_after",
  "is_valid",
  "days_remaining",
  "sans_changed",
  "last_error_message",
  "last_error_time",
  "created_at",
  "updated_at"
) AS SELECT id,
    account_id,
    profile_id,
    domain,
    folder_name,
    status,
    email,
    certificate,
    private_key,
    sans,
    issuer,
    not_before,
    not_after,
    is_valid,
    days_remaining,
    sans_changed,
    last_error_message,
    last_error_time,
    created_at,
    updated_at
   FROM vault.tls_certificates;
-- Set comment to view: "TlsCertificatesActiveView"
COMMENT ON VIEW "vault"."TlsCertificatesActiveView" IS 'TLS certificate rows for list/detail reads.';
