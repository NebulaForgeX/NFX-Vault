from enum import Enum
from typing import Optional


class CertificateStore(str, Enum):
    WEBSITES = "websites"
    APIS = "apis"
    DATABASE = "database"

    def __str__(self) -> str:
        return self.value

    @classmethod
    def validate(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        valid = {cls.WEBSITES.value, cls.APIS.value, cls.DATABASE.value}
        if value not in valid:
            raise ValueError(f"store must be one of {valid}")
        return value
