#!/usr/bin/env bash
# =============================================================================
# NFX-Vault 启动脚本 / Docker Compose start script
# =============================================================================
# 用法 / Usage:
#   ./start.sh                    构建并后台启动前后端（推荐）
#   FORCE_REBUILD_BACKEND=1 ./start.sh   先无缓存重建后端镜像再启动（修复过 Dockerfile
#   或曾出现「uvicorn: executable file not found」时使用）
#
# 若未配置免密 sudo，请改用:
#   sudo ./start.sh
#
# 启动前请确认项目根目录存在 .env，且已包含 MySQL / Redis / Kafka、CERTS_DIR、
# ACME_CHALLENGE_DIR、EMAIL_SMTP_*、JWT_SECRET 等（见 .example.env）。
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

COMPOSE=(sudo docker compose -f docker-compose.yml)

if [[ "${FORCE_REBUILD_BACKEND:-0}" == "1" ]]; then
  echo "[start.sh] FORCE_REBUILD_BACKEND=1 → build backend-api --no-cache"
  "${COMPOSE[@]}" build backend-api --no-cache
fi

echo "[start.sh] docker compose up -d --build"
"${COMPOSE[@]}" up -d --build

echo "[start.sh] done. Check: sudo docker compose -f docker-compose.yml ps"
