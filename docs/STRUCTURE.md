# NFX-Vault 项目结构

NFX-Vault 是 **Go + `console/`**。没有 Python `backend/`，没有旧 `frontend/`。登录走 **NFX-Identity**（`nfx-ui`）。证书文件在磁盘（certbot / `CERTS_DIR`），对象存储不走 Identity MinIO。

NFX-Vault is **Go + `console/`**. There is no Python `backend/` and no legacy `frontend/`. Login is **NFX-Identity** via `nfx-ui`.

```
NFX-Vault/
├── console/                         # React + Vite SPA（Identity 登录）
├── modules/
│   ├── tls/                         # 证书 list/apply/reapply/create/search + ACME HTTP-01
│   ├── file/                        # Websites 树 list/content/download/export/delete
│   ├── analysis/                    # POST /vault/analysis/tls
│   └── system/
├── inputs/{tls,file,analysis,system}/{api,connection,pipeline,messaging,base}/
├── databases/                       # Atlas SQL
├── events/  pkgs/  errors/  protos/
├── docker-compose.yml
├── docker-compose.dev.yml
└── scripts/cmd.sh                   # 本地证书目录巡检
```

HTTP 前缀 / HTTP prefixes:

| Prefix | Module |
|---|---|
| `/vault/tls` + `/.well-known/acme-challenge` | tls |
| `/vault/file` | file |
| `/vault/analysis` | analysis |

Kafka topics: `nfxvault.cert` / `nfxvault.file` / `nfxvault.analysis` / `nfxvault.system`（及 `*_poison`）。

消息总线 **仅 Kafka**。无 RabbitMQ、MySQL、MongoDB、OpenSearch。
