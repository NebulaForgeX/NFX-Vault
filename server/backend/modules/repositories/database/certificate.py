# coding=utf-8

"""
证书数据库仓库

MySQL 数据库数据访问
"""
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import and_

from models.tls_certificate import TLSCertificate

logger = logging.getLogger(__name__)


class CertificateDatabase:
    """证书数据库仓库"""
    
    def __init__(self, db_session: Optional[object] = None):
        """
        初始化数据库仓库
        
        Args:
            db_session: MySQLSession 对象（包含 get_session() 方法）
        """
        self.db_session = db_session
    
    def get_certificate_list(
        self,
        store: str,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[Dict], int]:
        """
        获取证书列表（支持分页）
        
        Args:
            store: 存储位置（websites、apis 或 database）
            page: 页码（从1开始）
            page_size: 每页数量
            
        Returns:
            (证书列表, 总数)
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，返回空列表")
            return [], 0
        
        try:
            with self.db_session.get_session() as session:
                # 查询总数
                total = session.query(TLSCertificate).filter(
                    TLSCertificate.store == store
                ).count()
                
                # 分页查询
                certs = session.query(TLSCertificate).filter(
                    TLSCertificate.store == store
                ).offset((page - 1) * page_size).limit(page_size).all()
                
                # 在 session 内部转换为字典，避免 DetachedInstanceError
                cert_dicts = [
                    {
                        "domain": cert.domain,
                        "source": cert.source,
                        "status": cert.status,
                        "email": cert.email,
                        "issuer": cert.issuer,
                        "not_before": cert.not_before,
                        "not_after": cert.not_after,
                        "is_valid": cert.is_valid,
                        "days_remaining": cert.days_remaining
                    }
                    for cert in certs
                ]
                
                return cert_dicts, total
        except Exception as e:
            logger.error(f"❌ 查询证书列表失败: {e}", exc_info=True)
            return [], 0
    
    def get_certificate_by_domain(
        self, 
        store: str, 
        domain: str,
        source: str = 'auto'
    ) -> Optional[Dict[str, Any]]:
        """
        根据域名和来源获取证书
        
        Args:
            store: 存储位置（websites 或 apis）
            domain: 域名
            source: 来源（auto 或 manual），默认为 auto
        
        Returns:
            证书字典，如果不存在则返回 None
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，返回 None")
            return None
        
        try:
            with self.db_session.get_session() as session:
                cert = session.query(TLSCertificate).filter(
                    and_(
                        TLSCertificate.store == store,
                        TLSCertificate.domain == domain,
                        TLSCertificate.source == source
                    )
                ).first()
                
                if not cert:
                    return None
                
                # 在 session 内部转换为字典，避免 DetachedInstanceError
                return {
                    "domain": cert.domain,
                    "store": cert.store,
                    "folder_name": cert.folder_name,
                    "source": cert.source,
                    "status": cert.status,
                    "email": cert.email,
                    "certificate": cert.certificate,
                    "private_key": cert.private_key,
                    "sans": cert.sans or [],
                    "issuer": cert.issuer,
                    "not_before": cert.not_before,
                    "not_after": cert.not_after,
                    "is_valid": cert.is_valid,
                    "days_remaining": cert.days_remaining
                }
        except Exception as e:
            logger.error(f"❌ 查询证书失败: {e}", exc_info=True)
            return None
    
    def get_certificate_by_folder_name(
        self,
        folder_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        根据文件夹名称获取证书
        
        Args:
            folder_name: 文件夹名称（唯一）
        
        Returns:
            证书字典，如果不存在则返回 None
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，返回 None")
            return None
        
        try:
            with self.db_session.get_session() as session:
                cert = session.query(TLSCertificate).filter(
                    TLSCertificate.folder_name == folder_name
                ).first()
                
                if not cert:
                    return None
                
                # 在 session 内部转换为字典，避免 DetachedInstanceError
                return {
                    "domain": cert.domain,
                    "store": cert.store,
                    "folder_name": cert.folder_name,
                    "source": cert.source,
                    "status": cert.status,
                    "email": cert.email,
                    "certificate": cert.certificate,
                    "private_key": cert.private_key,
                    "sans": cert.sans or [],
                    "issuer": cert.issuer,
                    "not_before": cert.not_before,
                    "not_after": cert.not_after,
                    "is_valid": cert.is_valid,
                    "days_remaining": cert.days_remaining
                }
        except Exception as e:
            logger.error(f"❌ 查询证书失败: {e}", exc_info=True)
            return None
    
    def create_or_update_certificate(
        self,
        store: str,
        domain: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        source: str = 'auto',
        status: Optional[str] = None,
        email: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None
    ) -> Optional[TLSCertificate]:
        """
        创建或更新证书（根据 folder_name 的唯一约束）
        
        Args:
            store: 存储位置
            domain: 域名
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式）
            source: 来源（auto 或 manual），默认为 auto
            email: 邮箱地址（用于 Let's Encrypt 通知）
            sans: SANs 列表
            issuer: 颁发者
            not_before: 有效期开始时间
            not_after: 有效期结束时间
            is_valid: 是否有效
            days_remaining: 剩余天数
            folder_name: 文件夹名称（唯一）
            
        Returns:
            证书对象
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，无法创建/更新证书")
            return None
        
        try:
            with self.db_session.get_session() as session:
                # 如果提供了 folder_name，根据 folder_name 查询
                if folder_name:
                    existing = session.query(TLSCertificate).filter(
                        TLSCertificate.folder_name == folder_name
                    ).first()
                else:
                    # 否则根据 domain + source 查询（向后兼容）
                    existing = session.query(TLSCertificate).filter(
                        and_(
                            TLSCertificate.domain == domain,
                            TLSCertificate.source == source
                        )
                    ).first()
                
                if existing:
                    # 更新现有记录（保持原有 source）
                    existing.store = store
                    if certificate is not None:
                        existing.certificate = certificate
                    if private_key is not None:
                        existing.private_key = private_key
                    if status is not None:
                        existing.status = status
                    if email is not None:
                        existing.email = email
                    existing.sans = sans
                    existing.issuer = issuer
                    existing.not_before = not_before
                    existing.not_after = not_after
                    existing.is_valid = is_valid
                    existing.days_remaining = days_remaining
                    existing.updated_at = datetime.now()
                    # 不更新 source，保持原有 source
                    # session.commit() 由 context manager 自动处理
                    logger.debug(f"✅ 更新证书（upsert）: folder_name={folder_name}, domain={domain}, source={existing.source}")
                    return existing
                else:
                    # 创建新记录（upsert 的 insert 部分）
                    new_cert = TLSCertificate(
                        store=store,
                        domain=domain,
                        folder_name=folder_name,
                        source=source,
                        certificate=certificate,
                        private_key=private_key,
                        status=status,
                        email=email,
                        sans=sans,
                        issuer=issuer,
                        not_before=not_before,
                        not_after=not_after,
                        is_valid=is_valid,
                        days_remaining=days_remaining
                    )
                    session.add(new_cert)
                    # session.commit() 由 context manager 自动处理
                    logger.debug(f"✅ 创建证书（upsert）: folder_name={folder_name}, domain={domain}, source={source}")
                    return new_cert
        except Exception as e:
            logger.error(f"❌ Upsert 证书失败: folder_name={folder_name}, domain={domain}, source={source}, error={e}", exc_info=True)
            return None
    
    def create_certificate_with_folder(
        self,
        store: str,
        domain: str,
        folder_name: str,
        certificate: str,
        private_key: str,
        source: str = 'auto',
        status: Optional[str] = None,
        email: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None
    ) -> Optional[TLSCertificate]:
        """
        创建证书（带 folder_name）
        
        Args:
            store: 存储位置
            domain: 域名
            folder_name: 文件夹名称（唯一）
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式）
            source: 来源（auto 或 manual），默认为 auto
            status: 状态
            email: 邮箱地址
            sans: SANs 列表
            issuer: 颁发者
            not_before: 有效期开始时间
            not_after: 有效期结束时间
            is_valid: 是否有效
            days_remaining: 剩余天数
            
        Returns:
            证书对象
        """
        return self.create_or_update_certificate(
            store=store,
            domain=domain,
            folder_name=folder_name,
            certificate=certificate,
            private_key=private_key,
            source=source,
            status=status,
            email=email,
            sans=sans,
            issuer=issuer,
            not_before=not_before,
            not_after=not_after,
            is_valid=is_valid,
            days_remaining=days_remaining
        )
    
    def update_certificate_by_folder_name(
        self,
        folder_name: str,
        store: Optional[str] = None,
        domain: Optional[str] = None,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        status: Optional[str] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None
    ) -> Optional[TLSCertificate]:
        """
        根据 folder_name 更新证书（保持原有 source）
        
        Args:
            folder_name: 文件夹名称（唯一）
            store: 存储位置
            domain: 域名
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式）
            status: 状态
            issuer: 颁发者
            not_before: 有效期开始时间
            not_after: 有效期结束时间
            is_valid: 是否有效
            days_remaining: 剩余天数
            
        Returns:
            更新后的证书对象，如果不存在则返回 None
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，无法更新证书")
            return None
        
        try:
            with self.db_session.get_session() as session:
                cert = session.query(TLSCertificate).filter(
                    TLSCertificate.folder_name == folder_name
                ).first()
                
                if not cert:
                    logger.warning(f"⚠️  证书不存在: folder_name={folder_name}")
                    return None
                
                # 只更新提供的字段，保持原有 source
                if store is not None:
                    cert.store = store
                if domain is not None:
                    cert.domain = domain
                if certificate is not None:
                    cert.certificate = certificate
                if private_key is not None:
                    cert.private_key = private_key
                if status is not None:
                    cert.status = status
                if issuer is not None:
                    cert.issuer = issuer
                if not_before is not None:
                    cert.not_before = not_before
                if not_after is not None:
                    cert.not_after = not_after
                if is_valid is not None:
                    cert.is_valid = is_valid
                if days_remaining is not None:
                    cert.days_remaining = days_remaining
                
                cert.updated_at = datetime.now()
                # session.commit() 由 context manager 自动处理
                logger.debug(f"✅ 更新证书: folder_name={folder_name}, source={cert.source} (保持原有)")
                return cert
        except Exception as e:
            logger.error(f"❌ 更新证书失败: folder_name={folder_name}, error={e}", exc_info=True)
            return None
    
    def create_certificate(
        self,
        store: str,
        domain: str,
        certificate: str,
        private_key: str,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = True,
        days_remaining: Optional[int] = None,
        folder_name: Optional[str] = None
    ) -> Optional[TLSCertificate]:
        """
        创建证书（手动添加，source 固定为 manual，默认存到 database）
        
        Args:
            store: 存储位置（默认 database）
            domain: 域名
            certificate: 证书内容（PEM格式）
            private_key: 私钥内容（PEM格式）
            sans: SANs 列表
            issuer: 颁发者
            not_before: 有效期开始时间
            not_after: 有效期结束时间
            is_valid: 是否有效
            days_remaining: 剩余天数
            folder_name: 文件夹名称（可选）
            
        Returns:
            证书对象，如果已存在则返回 None
        """
        return self.create_or_update_certificate(
            store=store,
            domain=domain,
            folder_name=folder_name,
            certificate=certificate,
            private_key=private_key,
            source='manual',
            status='process',  # 用户添加时显示 process
            sans=sans,
            issuer=issuer,
            not_before=not_before,
            not_after=not_after,
            is_valid=is_valid,
            days_remaining=days_remaining
        )
    
    def update_certificate(
        self,
        domain: str,
        source: str,
        certificate: Optional[str] = None,
        private_key: Optional[str] = None,
        store: Optional[str] = None,
        sans: Optional[List[str]] = None,
        issuer: Optional[str] = None,
        not_before: Optional[datetime] = None,
        not_after: Optional[datetime] = None,
        is_valid: Optional[bool] = None,
        days_remaining: Optional[int] = None
    ) -> Optional[TLSCertificate]:
        """
        更新证书（根据 domain + source）
        
        Args:
            domain: 域名
            source: 来源（auto 或 manual）
            certificate: 证书内容（PEM格式），可选
            private_key: 私钥内容（PEM格式），可选
            store: 存储位置，可选
            sans: SANs 列表，可选
            issuer: 颁发者，可选
            not_before: 有效期开始时间，可选
            not_after: 有效期结束时间，可选
            is_valid: 是否有效，可选
            days_remaining: 剩余天数，可选
            
        Returns:
            更新后的证书对象，如果不存在则返回 None
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，无法更新证书")
            return None
        
        try:
            with self.db_session.get_session() as session:
                cert = session.query(TLSCertificate).filter(
                    and_(
                        TLSCertificate.domain == domain,
                        TLSCertificate.source == source
                    )
                ).first()
                
                if not cert:
                    logger.warning(f"⚠️  证书不存在: domain={domain}, source={source}")
                    return None
                
                # 只更新提供的字段，保持原有 source
                if store is not None:
                    cert.store = store
                if certificate is not None:
                    cert.certificate = certificate
                if private_key is not None:
                    cert.private_key = private_key
                if sans is not None:
                    cert.sans = sans
                if issuer is not None:
                    cert.issuer = issuer
                if not_before is not None:
                    cert.not_before = not_before
                if not_after is not None:
                    cert.not_after = not_after
                if is_valid is not None:
                    cert.is_valid = is_valid
                if days_remaining is not None:
                    cert.days_remaining = days_remaining
                
                cert.updated_at = datetime.now()
                # session.commit() 由 context manager 自动处理
                logger.debug(f"✅ 更新证书: domain={domain}, source={source}")
                return cert
        except Exception as e:
            logger.error(f"❌ 更新证书失败: domain={domain}, source={source}, error={e}", exc_info=True)
            return None
    
    def delete_certificate(
        self,
        domain: str,
        source: str
    ) -> bool:
        """
        删除证书（根据 domain + source）
        
        Args:
            domain: 域名
            source: 来源（auto 或 manual）
            
        Returns:
            是否删除成功
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，无法删除证书")
            return False
        
        try:
            with self.db_session.get_session() as session:
                deleted_count = session.query(TLSCertificate).filter(
                    and_(
                        TLSCertificate.domain == domain,
                        TLSCertificate.source == source
                    )
                ).delete()
                session.commit()
                
                if deleted_count > 0:
                    logger.info(f"✅ 删除证书: domain={domain}, source={source}")
                    return True
                else:
                    logger.warning(f"⚠️  证书不存在: domain={domain}, source={source}")
                    return False
        except Exception as e:
            logger.error(f"❌ 删除证书失败: domain={domain}, source={source}, error={e}", exc_info=True)
            return False
    
    def delete_certificates_by_store(self, store: str, source: str = 'auto') -> int:
        """
        删除指定 store 和 source 的所有证书
        
        Args:
            store: 存储位置
            source: 来源（auto 或 manual），默认为 auto
            
        Returns:
            删除的记录数
        """
        if not self.db_session or not hasattr(self.db_session, 'get_session'):
            logger.warning("⚠️  数据库会话未初始化，无法删除证书")
            return 0
        
        try:
            with self.db_session.get_session() as session:
                deleted_count = session.query(TLSCertificate).filter(
                    and_(
                        TLSCertificate.store == store,
                        TLSCertificate.source == source
                    )
                ).delete()
                session.commit()
                logger.info(f"✅ 删除 {deleted_count} 条证书记录: store={store}, source={source}")
                return deleted_count
        except Exception as e:
            logger.error(f"❌ 删除证书失败: {e}", exc_info=True)
            return 0

