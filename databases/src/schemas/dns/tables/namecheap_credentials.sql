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
