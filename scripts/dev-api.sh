#!/usr/bin/env bash
# NFX-Vault 仓库根目录：创建/同步 venv + 启动 API（uvicorn 开发热重载）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VAULT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_ROOT="$VAULT_ROOT/backend"

# 与 frontend/vite.config.ts 代理一致：默认 10151；仓库根 .env 中 BACKEND_PORT 优先；仍可用 NFX_VAULT_API_PORT 覆盖
DEFAULT_API_PORT="10151"
if [[ -f "$VAULT_ROOT/.env" ]]; then
  _line=$(grep -E '^[[:space:]]*BACKEND_PORT=' "$VAULT_ROOT/.env" 2>/dev/null | tail -1 || true)
  if [[ -n "$_line" ]]; then
    _val="${_line#*=}"
    _val="${_val%%#*}"
    _val="${_val//\'/}"
    _val="${_val//\"/}"
    _val="${_val//[[:space:]]/}"
    [[ -n "$_val" ]] && DEFAULT_API_PORT="$_val"
  fi
fi
export NFX_VAULT_API_PORT="${NFX_VAULT_API_PORT:-$DEFAULT_API_PORT}"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/backend-venv.sh"

export NFX_VAULT_DEV=1
echo "[NFX-Vault] API 端口: ${NFX_VAULT_API_PORT}（与 frontend/vite 代理 target 一致）" >&2
exec "$VENV_PY" -m inputs.api.main
