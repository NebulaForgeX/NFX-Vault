# NFX-Vault Backend（Farmwatch 风格 MVC）

对齐 [Farmwatch-Backend `backends/`](../Farmwatch-Backend/docs/backends/ARCHITECTURE.md) 的分层；功能对齐原 `backend_old/` 双进程架构，现为单进程（HTTP + Kafka Consumer + 定时任务）。

## 已实现能力

| 模块 | 说明 |
|------|------|
| **`/vault/tls/*`** | 证书 CRUD、刷新/缓存失效（发 Kafka）、申请与重申请、搜索 |
| **`/vault/file/*`** | 导出、列表、下载、文本内容、删除（删操作发 Kafka，由 Consumer 落盘删） |
| **`/vault/analysis/tls`** | PEM 解析分析（不入库） |
| **`/.well-known/acme-challenge/{token}`** | ACME HTTP-01 读盘响应 |
| **Kafka Consumer** | 同进程后台线程：`operation.refresh`、`cache.invalidate`、`certificate.parse`、`folder.delete`、`file_or_folder.delete`、`certificate.export` |
| **`READ_ON_STARTUP`** | 启动时扫描 `CERTS_DIR` 下 Websites/Apis 目录入库 |
| **APScheduler** | `SCHEDULE_ENABLED` 时：每周读目录、每天 01:00 更新剩余天数并处理 auto 续签 |

## 目录（摘要）

- `routers/urls.py` — 根路由聚合  
- `routers/acme_router.py` — ACME  
- `apps/wiring.py` — `ApplicationStack`（DB/Redis/Kafka/各 Service/Consumer 注册）  
- `apps/certificate/` — TLS；`kafka/` 含 Consumer 路由、`certificate_pipeline`（发 Kafka）  
- `apps/file/` — 文件与导出  
- `apps/analysis/` — TLS 分析  
- `utils/kafka/`、`utils/mysql/`、`utils/redis/`、`utils/acme/`、`utils/certbot/` — 外设客户端  
- `utils/pem/` — PEM/openssl 解析（`parse.py`，无业务）  
- `tasks/` — 定时任务  

## 依赖

见 `requirements.txt`（含 `kafka-python-ng`、`apscheduler`）。需配置与原 `backend_old` 一致的环境变量（`MYSQL_*`、`REDIS_*`、`KAFKA_*`、`CERTS_DIR`、`ACME_CHALLENGE_DIR` 等）。

## 运行

本地开发（与 frontend Vite 代理端口一致，默认读仓库根 `.env` 的 `BACKEND_PORT`）：

```bash
./scripts/dev-api.sh
```

或直接：

```bash
cd backend
export PYTHONPATH=.
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Docker**：根目录 `docker-compose.yml` 构建上下文为 `./backend`（原独立 pipeline 已删除，Consumer/调度在 API 进程内）。
