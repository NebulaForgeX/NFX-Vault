CREATE OR REPLACE VIEW "vault"."TlsCertificatesActiveView" AS
SELECT
  "id", "account_id", "profile_id", "domain", "folder_name", "status",
  "email", "certificate", "private_key", "sans", "issuer",
  "not_before", "not_after", "is_valid", "days_remaining", "sans_changed",
  "last_error_message", "last_error_time", "created_at", "updated_at"
FROM "vault"."tls_certificates";

COMMENT ON VIEW "vault"."TlsCertificatesActiveView" IS 'TLS certificate rows for list/detail reads.';
