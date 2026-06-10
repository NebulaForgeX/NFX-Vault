-- Add sans_changed column to tls_certificates (PostgreSQL).
-- Run against the NFX-Vault PostgreSQL database after backup.

ALTER TABLE tls_certificates
  ADD COLUMN IF NOT EXISTS sans_changed BOOLEAN NOT NULL DEFAULT FALSE;
