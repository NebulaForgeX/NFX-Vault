from .cert_config import load_cert_config
from .database_config import load_database_config
from .types import CertConfig, DatabaseConfig


def load_config() -> tuple[CertConfig, DatabaseConfig]:
    return load_cert_config(), load_database_config()
