-- Active: 1771480000173@@192.168.1.64@10101@nfxvault
-- SAN 列表在「手动更新」中被增删改后标记为需重新申请，与已签发证书对齐。
-- Run against the NFX-Vault MySQL database after backup.

ALTER TABLE tls_certificates
  ADD COLUMN sans_changed TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1=SANS list edited, re-apply TLS to align issued cert'
  AFTER days_remaining;
