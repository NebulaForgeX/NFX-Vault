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
