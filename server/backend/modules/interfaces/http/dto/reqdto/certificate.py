# coding=utf-8

"""
证书相关的请求 DTO

定义创建、更新、删除证书的请求模型
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

from enums.certificate_source import CertificateSource
from enums.certificate_store import CertificateStore


class CreateCertificateRequest(BaseModel):
    """创建证书请求"""
    store: str = Field(..., description="存储位置（websites、apis 或 database）")
    domain: str = Field(..., description="域名")
    certificate: str = Field(..., description="证书内容（PEM格式）")
    private_key: str = Field(..., description="私钥内容（PEM格式）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    folder_name: Optional[str] = Field(None, description="文件夹名称")
    email: Optional[str] = Field(None, description="邮箱地址")
    issuer: Optional[str] = Field(None, description="颁发者")


class UpdateManualAddCertificateRequest(BaseModel):
    """更新手动添加证书请求（MANUAL_ADD）"""
    certificate_id: str = Field(..., description="证书 ID（必需）")
    certificate: Optional[str] = Field(None, description="证书内容（PEM格式）")
    private_key: Optional[str] = Field(None, description="私钥内容（PEM格式）")
    store: Optional[str] = Field(None, description="存储位置（websites、apis 或 database）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    folder_name: Optional[str] = Field(None, description="文件夹名称")
    email: Optional[str] = Field(None, description="邮箱地址")
    
    @field_validator('store')
    @classmethod
    def validate_store(cls, v: Optional[str]) -> Optional[str]:
        """验证 store 字段"""
        return CertificateStore.validate(v)


class UpdateManualApplyCertificateRequest(BaseModel):
    """更新手动申请证书请求（MANUAL_APPLY）"""
    domain: str = Field(..., description="域名")
    folder_name: str = Field(..., description="文件夹名称（必需）")
    store: Optional[str] = Field(None, description="证书类型（可选：websites, apis, database）")


class DeleteCertificateRequest(BaseModel):
    """删除证书请求"""
    domain: str = Field(..., description="域名")
    source: CertificateSource = Field(..., description="来源（CertificateSource枚举）")


class ApplyCertificateRequest(BaseModel):
    """
    申请证书请求（统一存储在 database）
    
    注意：如果 80 端口被 Traefik 占用，需要确保 Traefik 能够正确转发
    `/.well-known/acme-challenge/` 路径到 webroot 目录。或者使用 Traefik
    的自动证书管理功能（推荐）。
    """
    domain: str = Field(..., description="主域名")
    email: str = Field(..., description="邮箱地址（用于 Let's Encrypt 通知）")
    folder_name: str = Field(..., description="文件夹名称（唯一标识符）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    webroot: Optional[str] = Field(
        None, 
        description="Webroot 路径（用于 HTTP-01 验证），留空使用默认路径。"
                   "即使 80 端口被 Traefik 占用，只要 Traefik 能正确转发 "
                   "`/.well-known/acme-challenge/` 路径到 webroot，验证仍可成功。"
    )

