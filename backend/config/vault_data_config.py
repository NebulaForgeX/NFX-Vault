"""头像与临时文件根目录：`data/tmp`、`data/avatar`（无 dev/prod 分目录）。

环境变量 VAULT_DATA_DIR：绝对路径，或相对「仓库根（含 backend 子目录时）/ 镜像内 /app」的路径，例如 `./data`。
"""
from __future__ import annotations

import os
from pathlib import Path

from .types import VaultDataConfig


def _layout_base_dir() -> Path:
    """仓库：NFX-Vault 根（含 backend/main.py）；Docker 镜像：/app（扁平 backend 内容）。"""
    here = Path(__file__).resolve()
    repo_root = here.parents[2]
    if (repo_root / "backend" / "main.py").is_file():
        return repo_root
    return here.parents[1]


def load_vault_data_config() -> VaultDataConfig:
    base = _layout_base_dir()
    raw = os.environ.get("VAULT_DATA_DIR", "").strip()
    if raw:
        p = Path(raw)
        if p.is_absolute():
            return VaultDataConfig(DATA_DIR=str(p.resolve()))
        return VaultDataConfig(str((base / p).resolve()))
    return VaultDataConfig(str((base / "data").resolve()))
