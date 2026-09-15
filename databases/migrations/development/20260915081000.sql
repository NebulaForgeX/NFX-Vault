-- pgcrypto.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

-- schema.sql
CREATE SCHEMA IF NOT EXISTS "vault";
COMMENT ON SCHEMA "vault" IS 'NFX-Vault TLS certificates';

-- tls_certificates.sql
CREATE TABLE IF NOT EXISTS "vault"."tls_certificates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" UUID,
  "profile_id" UUID,
  "domain" VARCHAR(255) NOT NULL,
  "folder_name" VARCHAR(255),
  "status" VARCHAR(32) DEFAULT 'process',
  "email" VARCHAR(255),
  "certificate" TEXT,
  "private_key" TEXT,
  "sans" JSONB DEFAULT '[]'::jsonb,
  "issuer" VARCHAR(255),
  "not_before" TIMESTAMP,
  "not_after" TIMESTAMP,
  "is_valid" BOOLEAN DEFAULT TRUE,
  "days_remaining" INTEGER,
  "sans_changed" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_error_message" TEXT,
  "last_error_time" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tls_certificates_domain ON "vault"."tls_certificates" ("domain");

-- tls_certificates_active_view.sql
CREATE OR REPLACE VIEW "vault"."TlsCertificatesActiveView" AS
SELECT
  "id", "account_id", "profile_id", "domain", "folder_name", "status",
  "email", "certificate", "private_key", "sans", "issuer",
  "not_before", "not_after", "is_valid", "days_remaining", "sans_changed",
  "last_error_message", "last_error_time", "created_at", "updated_at"
FROM "vault"."tls_certificates";

COMMENT ON VIEW "vault"."TlsCertificatesActiveView" IS 'TLS certificate rows for list/detail reads.';

-- schema.sql
CREATE SCHEMA IF NOT EXISTS "system";

-- system_state.sql
CREATE TABLE IF NOT EXISTS "system"."system_state" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "initialized" BOOLEAN NOT NULL DEFAULT false,
  "initialized_at" TIMESTAMP,
  "initialization_version" VARCHAR(50),
  "reset_count" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_system_state_created_at" ON "system"."system_state"("created_at" DESC);

-- system_state_active_view.sql
CREATE OR REPLACE VIEW "system"."SystemStateActiveView" AS
SELECT
  "id", "initialized", "initialized_at", "initialization_version",
  "reset_count", "metadata", "created_at", "updated_at"
FROM "system"."system_state";

COMMENT ON VIEW "system"."SystemStateActiveView" IS 'System bootstrap state rows.';
