"""路径参数 store 枚举（websites / apis / database）。"""
from enum import Enum


class CertStore(str, Enum):
    websites = "websites"
    apis = "apis"
    database = "database"
