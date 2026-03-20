"""从仓库根目录加载 .env（backend/config → 上两级为 NFX-Vault 根）。"""
from pathlib import Path

from dotenv import load_dotenv


def load_repo_dotenv() -> None:
    vault_root = Path(__file__).resolve().parents[2]
    load_dotenv(vault_root / ".env", override=False)
