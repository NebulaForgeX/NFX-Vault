from enum import Enum


class CertificateStatus(str, Enum):
    SUCCESS = "success"
    FAIL = "fail"
    PROCESS = "process"

    def __str__(self) -> str:
        return self.value
