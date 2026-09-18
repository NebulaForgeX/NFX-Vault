CREATE OR REPLACE VIEW "dns"."NamecheapCredentialsActiveView" AS
SELECT
  "id", "account_id", "profile_id", "api_user", "user_name", "api_key",
  "client_ip", "sandbox", "last_verified_at", "last_error_message",
  "created_at", "updated_at"
FROM "dns"."namecheap_credentials";

COMMENT ON VIEW "dns"."NamecheapCredentialsActiveView" IS 'Namecheap credential rows for list/detail reads.';
