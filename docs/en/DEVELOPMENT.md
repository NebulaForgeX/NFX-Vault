# NFX-Vault development

Runtime is **Go modules + `console/`**. Login is NFX-Identity. There is no Python `backend/` and no legacy `frontend/`.

## Prerequisites

- Go (see `go.mod`)
- Node.js 18+ (`console/`)
- Docker Compose
- NFX-Stack: PostgreSQL, Redis, Kafka, OTEL
- A running **NFX-Identity** (`TOKEN_*` must match)

```bash
source /volume1/Environments/use-menv.sh
cp .example.env .env
```

## Layout

See [STRUCTURE.md](STRUCTURE.md). Modules: `tls` / `file` / `analysis` / `system`. Entrypoints: `inputs/<module>/{api,connection,pipeline,messaging,base}`.

```bash
go build ./...
go run ./inputs/tls/api
sudo docker compose -f docker-compose.dev.yml up --build
```

Change schema in `databases/src/**` then Atlas. Do not hand-edit `*_dbgen.go`.

```bash
cd console && npm install && npm run dev
```

Build NFX-UI (`npm run build` + dts) first. Console login is Identity HTTP.

Kafka only: `nfxvault.cert` / `nfxvault.file` / `nfxvault.analysis` / `nfxvault.system`.
