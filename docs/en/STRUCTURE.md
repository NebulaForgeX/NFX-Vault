# NFX-Vault structure

NFX-Vault is **Go + `console/`**. There is no Python `backend/` and no legacy `frontend/`. Login is **NFX-Identity** via `nfx-ui`. Certificate bytes live on disk (certbot / `CERTS_DIR`), not Identity MinIO.

```
NFX-Vault/
├── console/                         # React + Vite SPA (Identity login)
├── modules/{tls,file,analysis,system}/
├── inputs/{tls,file,analysis,system}/{api,connection,pipeline,messaging,base}/
├── databases/                       # Atlas SQL
├── events/  pkgs/  errors/  protos/
├── docker-compose.yml
└── scripts/cmd.sh
```

HTTP prefixes: `/vault/tls` (+ ACME `/.well-known/acme-challenge`), `/vault/file`, `/vault/analysis`.

Kafka topics: `nfxvault.cert` / `nfxvault.file` / `nfxvault.analysis` / `nfxvault.system` (and `*_poison`). Kafka only — no RabbitMQ, MySQL, MongoDB, or OpenSearch.
