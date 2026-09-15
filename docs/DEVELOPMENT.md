# NFX-Vault 开发指南

运行时是 **Go 模块 + `console/`**。登录走 NFX-Identity。不要再找 `backend/` 或 Python venv。

Runtime is **Go modules + `console/`**. Login is NFX-Identity. There is no `backend/` Python tree.

## 前置 / Prerequisites

- Go（与 `go.mod` 一致）
- Node.js 18+（`console/`）
- Docker Compose
- NFX-Stack：PostgreSQL、Redis、Kafka、OTEL
- 本机已跑的 **NFX-Identity**（JWT `TOKEN_*` 必须一致）

```bash
source /volume1/Environments/use-menv.sh
cp .example.env .env
```

## 结构 / Layout

见 [STRUCTURE.md](STRUCTURE.md)。模块：`tls` / `file` / `analysis` / `system`。入口在 `inputs/<module>/{api,connection,pipeline,messaging,base}`。

## 后端 / Backend

```bash
go build ./...
go run ./inputs/tls/api
# 或
sudo docker compose -f docker-compose.dev.yml up --build
```

Schema：改 `databases/src/**` 再 Atlas，禁止手改 `*_dbgen.go`。

## Console

```bash
cd console
npm install
npm run dev
```

`nfx-ui` 用 `file:` 依赖。先在 `NFX-UI` 跑 `npm run build` 并生成 dts。登录走 Identity HTTP，不要本地 `/auth`。

## 消息 / Messaging

仅 Kafka：`nfxvault.cert` / `nfxvault.file` / `nfxvault.analysis` / `nfxvault.system`。无 RabbitMQ / MySQL / MongoDB。
