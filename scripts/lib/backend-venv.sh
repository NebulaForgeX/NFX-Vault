# shellcheck shell=bash
# 由 dev-api.sh source。前置条件：已设置 BACKEND_ROOT（仓库根下的 backend/）
#
# .venv 位于 backend/.venv。创建时使用 --without-pip，避免部分 NAS / AppCentral Python
# 在 ensurepip 阶段卡住；pip 通过 get-pip 或 ensurepip 补全。

cd "$BACKEND_ROOT" || exit 1

REQ="$BACKEND_ROOT/requirements.txt"
SYNC_STAMP="$BACKEND_ROOT/.venv/.nfx-requirements-sync"
NEW_VENV=0

_nfx_venv_bootstrap_pip() {
  local py="$1"
  echo "[NFX-Vault] 正在为 venv 安装 pip …" >&2
  local get_pip="$BACKEND_ROOT/.venv/get-pip.py"
  if command -v curl >/dev/null 2>&1; then
    if curl -fsSL "https://bootstrap.pypa.io/get-pip.py" -o "$get_pip"; then
      "$py" "$get_pip" --no-warn-script-location
      rm -f "$get_pip"
      return 0
    fi
    rm -f "$get_pip"
  fi
  echo "[NFX-Vault] get-pip 不可用，尝试 ensurepip（可能较慢）…" >&2
  "$py" -m ensurepip --default-pip
}

_nfx_venv_ok() {
  local py="$BACKEND_ROOT/.venv/bin/python3"
  [[ -x "$py" ]] || return 1
  [[ -x "$BACKEND_ROOT/.venv/bin/pip" ]] || [[ -x "$BACKEND_ROOT/.venv/bin/pip3" ]] || return 1
  return 0
}

if [[ -d .venv ]] && ! _nfx_venv_ok; then
  echo "[NFX-Vault] 检测到不完整 backend/.venv（例如创建时被 Ctrl-C 中断），正在删除并重试…" >&2
  rm -rf .venv
fi

if [[ ! -d .venv ]]; then
  echo "[NFX-Vault] 创建 backend/.venv（--without-pip，避免 ensurepip 卡死）…" >&2
  python3 -m venv .venv --without-pip
  NEW_VENV=1
else
  echo "[NFX-Vault] 使用已有虚拟环境: $BACKEND_ROOT/.venv" >&2
fi

VENV_PY="$BACKEND_ROOT/.venv/bin/python3"
if [[ ! -x "$VENV_PY" ]]; then
  echo "[NFX-Vault] 错误: backend/.venv 缺少 bin/python3" >&2
  exit 1
fi

VENV_PIP="$BACKEND_ROOT/.venv/bin/pip"
[[ -x "$VENV_PIP" ]] || VENV_PIP="$BACKEND_ROOT/.venv/bin/pip3"
if [[ ! -x "$VENV_PIP" ]]; then
  _nfx_venv_bootstrap_pip "$VENV_PY"
  VENV_PIP="$BACKEND_ROOT/.venv/bin/pip"
  [[ -x "$VENV_PIP" ]] || VENV_PIP="$BACKEND_ROOT/.venv/bin/pip3"
fi
if [[ ! -x "$VENV_PIP" ]]; then
  echo "[NFX-Vault] 错误: 无法安装 pip，请检查网络或手动: python3 -m venv .venv" >&2
  exit 1
fi

echo "[NFX-Vault] $($VENV_PY --version)" >&2

if [[ "$NEW_VENV" -eq 1 ]] || [[ ! -f "$SYNC_STAMP" ]] || [[ "$REQ" -nt "$SYNC_STAMP" ]]; then
  echo "[NFX-Vault] 同步 backend 依赖: pip install -r requirements.txt …" >&2
  "$VENV_PIP" install --upgrade pip >/dev/null
  "$VENV_PIP" install -r "$REQ"
  touch "$SYNC_STAMP"
else
  echo "[NFX-Vault] backend/requirements.txt 未变更，跳过 pip install" >&2
fi

export PYTHONPATH="$BACKEND_ROOT"
