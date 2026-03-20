# coding=utf-8
"""
本地开发时从 NFX-Vault 仓库根目录加载 `.env`。

Docker / Compose 会自行注入环境变量；`load_dotenv(..., override=False)` 不会覆盖已有变量。
"""
from pathlib import Path


def load_repo_dotenv() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    vault_root = Path(__file__).resolve().parents[3]
    load_dotenv(vault_root / ".env", override=False)
