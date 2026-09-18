#!/usr/bin/env bash
# =============================================================================
# NFX-Vault 启动脚本 / Docker Compose start script
# =============================================================================
# 用法 / Usage:
#   ./start.sh                    构建并后台启动 Go 服务 + console
#
# 若未配置免密 sudo，请改用:
#   sudo ./start.sh
#
# 启动前请确认项目根目录存在 .env（见 .example.env）。
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! sudo docker network inspect nfx-edge >/dev/null 2>&1; then
  echo "[start.sh] nfx-edge network missing. Start NFX-Edge first (sole reverse proxy)."
  exit 1
fi

COMPOSE=(sudo docker compose -f docker-compose.yml)

echo "[start.sh] docker compose up -d --build"
"${COMPOSE[@]}" up -d --build

echo "[start.sh] done. Check: sudo docker compose -f docker-compose.yml ps"
