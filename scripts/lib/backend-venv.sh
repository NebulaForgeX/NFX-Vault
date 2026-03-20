# shellcheck shell=bash
# 由 dev-api.sh / dev-pipeline.sh source。前置条件：已设置 BACKEND_ROOT
#
# - .venv：仅当 backend/.venv 尚不存在时才创建；已有则直接沿用，不会重复创建。
# - pip：仅在新创建 venv、或 requirements.txt 有更新时才 install；否则跳过以加快启动。

cd "$BACKEND_ROOT" || exit 1

REQ="$BACKEND_ROOT/requirements.txt"
SYNC_STAMP="$BACKEND_ROOT/.venv/.nfx-requirements-sync"
NEW_VENV=0

if [[ ! -d .venv ]]; then
  echo "[NFX-Vault] 本地尚无 .venv，正在创建: $BACKEND_ROOT/.venv" >&2
  python3 -m venv .venv
  NEW_VENV=1
else
  echo "[NFX-Vault] 使用已有虚拟环境: $BACKEND_ROOT/.venv" >&2
fi

VENV_PY="$BACKEND_ROOT/.venv/bin/python3"
VENV_PIP="$BACKEND_ROOT/.venv/bin/pip"
if [[ ! -x "$VENV_PY" ]] || [[ ! -x "$VENV_PIP" ]]; then
  echo "[NFX-Vault] 错误: .venv 不完整，请删除 backend/.venv 后重试" >&2
  exit 1
fi

echo "[NFX-Vault] $($VENV_PY --version)" >&2

if [[ "$NEW_VENV" -eq 1 ]] || [[ ! -f "$SYNC_STAMP" ]] || [[ "$REQ" -nt "$SYNC_STAMP" ]]; then
  echo "[NFX-Vault] 同步依赖: pip install -r requirements.txt …" >&2
  "$VENV_PIP" install --upgrade pip >/dev/null
  "$VENV_PIP" install -r "$REQ"
  touch "$SYNC_STAMP"
else
  echo "[NFX-Vault] requirements.txt 未变更，跳过 pip install" >&2
fi

export PYTHONPATH="$BACKEND_ROOT"
