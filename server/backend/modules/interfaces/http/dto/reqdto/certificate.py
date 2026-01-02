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
    certificate_id: str = Field(..., description="证书 ID")


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


class ReapplyAutoCertificateRequest(BaseModel):
    """
    AUTO 证书重新申请请求
    
    行为：apply 之后还要写回等于 folder_name 的文件夹
    不能更新 domain 和 folder_name（从现有证书读取）
    """
    certificate_id: str = Field(..., description="证书 ID")
    email: str = Field(..., description="邮箱地址（用于 Let's Encrypt 通知）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    webroot: Optional[str] = Field(
        None, 
        description="Webroot 路径（用于 HTTP-01 验证），留空使用默认路径。"
    )
    force_renewal: Optional[bool] = Field(False, description="是否强制更新证书（即使未过期也重新申请）")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """验证邮箱格式"""
        if not v or "@" not in v:
            raise ValueError("Invalid email address")
        return v


class ReapplyManualApplyCertificateRequest(BaseModel):
    """
    MANUAL_APPLY 证书重新申请请求
    
    行为：正常的 apply 流程
    """
    certificate_id: str = Field(..., description="证书 ID")
    domain: str = Field(..., description="主域名")
    email: str = Field(..., description="邮箱地址（用于 Let's Encrypt 通知）")
    folder_name: str = Field(..., description="文件夹名称（唯一标识符）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    webroot: Optional[str] = Field(
        None, 
        description="Webroot 路径（用于 HTTP-01 验证），留空使用默认路径。"
    )
    force_renewal: Optional[bool] = Field(False, description="是否强制更新证书（即使未过期也重新申请）")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """验证邮箱格式"""
        if not v or "@" not in v:
            raise ValueError("Invalid email address")
        return v


class ReapplyManualAddCertificateRequest(BaseModel):
    """
    MANUAL_ADD 证书重新申请请求
    
    行为：根据现有资料发起 apply，只更新 Certificate Content、Private Key Content 以及事件
    """
    certificate_id: str = Field(..., description="证书 ID")
    email: str = Field(..., description="邮箱地址（用于 Let's Encrypt 通知）")
    sans: Optional[List[str]] = Field(None, description="SANs 列表")
    webroot: Optional[str] = Field(
        None, 
        description="Webroot 路径（用于 HTTP-01 验证），留空使用默认路径。"
    )
    force_renewal: Optional[bool] = Field(False, description="是否强制更新证书（即使未过期也重新申请）")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """验证邮箱格式"""
        if not v or "@" not in v:
            raise ValueError("Invalid email address")
        return v


class GetCertificateListRequest(BaseModel):
    """获取证书列表请求"""
    store: str = Field(..., description="存储位置（websites、apis 或 database）")
    offset: int = Field(0, ge=0, description="偏移量（从0开始）")
    limit: int = Field(20, ge=1, le=100, description="每页数量")


class GetCertificateDetailByIdRequest(BaseModel):
    """通过 ID 获取证书详情请求"""
    certificate_id: str = Field(..., description="证书 ID")


class PublishRefreshEventRequest(BaseModel):
    """发布刷新事件请求"""
    store: str = Field(..., description="存储位置（websites 或 apis）")
    trigger: str = Field("api", description="触发来源（api, manual）")


class InvalidateCacheRequest(BaseModel):
    """缓存失效请求"""
    store: str = Field(..., description="存储位置（websites, apis, database）")
    trigger: str = Field("manual", description="触发来源（manual, api）")


class SearchCertificateRequest(BaseModel):
    """搜索证书请求"""
    keyword: str = Field(..., description="搜索关键词（域名、文件夹名等）")
    store: Optional[str] = Field(None, description="存储位置过滤（可选）")
    source: Optional[str] = Field(None, description="来源过滤（可选）")
    offset: int = Field(0, description="偏移量（从0开始）")
    limit: int = Field(20, description="每页数量")
