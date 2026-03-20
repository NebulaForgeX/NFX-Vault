from enum import Enum


class CertificateSource(str, Enum):
    AUTO = "auto"
    MANUAL_APPLY = "manual_apply"
    MANUAL_ADD = "manual_add"

    def __str__(self) -> str:
        return self.value
