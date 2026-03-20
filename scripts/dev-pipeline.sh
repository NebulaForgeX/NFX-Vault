#!/usr/bin/env bash
# NFX-Vault 仓库根目录：创建/同步 venv + 启动 Pipeline（Kafka + 调度）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VAULT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_ROOT="$VAULT_ROOT/backend"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/lib/backend-venv.sh"

exec "$VENV_PY" -m inputs.pipeline.main
