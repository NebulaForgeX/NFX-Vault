from .auth_config import load_auth_config
from .cert_config import load_cert_config
from .database_config import load_database_config
from .vault_data_config import load_vault_data_config
from .types import AuthConfig, CertConfig, DatabaseConfig, VaultDataConfig


def load_config() -> tuple[CertConfig, DatabaseConfig, AuthConfig, VaultDataConfig]:
    return load_cert_config(), load_database_config(), load_auth_config(), load_vault_data_config()
