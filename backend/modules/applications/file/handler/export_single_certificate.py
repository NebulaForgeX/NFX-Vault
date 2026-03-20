# coding=utf-8

"""
导出单个证书 Handler
"""
import logging
import os
from typing import Dict, Any

from .protocol import FileAppLike
from enums.certificate_source import CertificateSource
from enums.certificate_status import CertificateStatus
from utils.certificate import extract_cert_info_from_pem_sync

logger = logging.getLogger(__name__)


def export_single_certificate(
    app: FileAppLike,
    certificate_id: str,
    store: str
) -> Dict[str, Any]:
    """
    导出单个证书到指定文件夹
    
    Args:
        app: FileApplication 实例
        certificate_id: 证书 ID
        store: 存储位置（websites 或 apis）
    
    Returns:
        导出结果
    """
    try:
        # 从数据库获取证书详情
        cert_detail = app.database_repo.get_certificate_by_id(certificate_id)
        if not cert_detail:
            return {
                "success": False,
                "message": f"Certificate not found: {certificate_id}",
                "certificate_id": certificate_id,
                "store": store
            }
        
        # 获取文件夹名称（从证书详情中获取）
        folder_name = cert_detail.get("folder_name")
        if not folder_name:
            return {
                "success": False,
                "message": f"Folder name not found for certificate: {certificate_id}",
                "certificate_id": certificate_id,
                "store": store
            }
        
        domain = cert_detail.get("domain")
        certificate = cert_detail.get("certificate", "")
        private_key = cert_detail.get("private_key", "")
        
        if not certificate or not private_key:
            return {
                "success": False,
                "message": f"Certificate or private key is empty for certificate: {certificate_id}",
                "certificate_id": certificate_id,
                "store": store
            }
        
        # 构建文件夹路径
        base_dir = app.base_dir
        store_dir = os.path.join(base_dir, store.capitalize())
        folder_path = os.path.join(store_dir, folder_name)
        
        # 确保文件夹存在
        os.makedirs(folder_path, exist_ok=True)
        
        # 写入证书和私钥文件
        cert_file = os.path.join(folder_path, "cert.crt")
        key_file = os.path.join(folder_path, "key.key")
        
        with open(cert_file, 'w') as f:
            f.write(certificate)
        
        with open(key_file, 'w') as f:
            f.write(private_key)
        
        logger.info(f"✅ 导出证书到文件夹: {folder_path} (domain: {domain}, certificate_id: {certificate_id})")
        
        # 在数据库中创建或更新记录（复制原证书的所有字段，但 store 改为导出的 store，source 改为 AUTO）
        if app.database_repo:
            try:
                # 提取证书信息（用于更新解析结果）
                cert_info = extract_cert_info_from_pem_sync(certificate)
                
                # 提取 SANs 和合并所有域名
                parsed_sans = cert_info.get("sans", [])
                all_domains = cert_info.get("all_domains", [])
                if not isinstance(all_domains, list):
                    all_domains = []
                # 确保 domain 在列表中
                if domain and domain not in all_domains:
                    all_domains.insert(0, domain)
                # 确保所有 SANs 都在列表中
                if parsed_sans:
                    for san in parsed_sans:
                        if san and san not in all_domains:
                            all_domains.append(san)
                
                # 检查数据库中是否已存在（根据 domain + source='auto' + store）
                if not app.database_repo.db_session or not hasattr(app.database_repo.db_session, 'get_session'):
                    logger.warning("⚠️  数据库会话未初始化，无法创建/更新证书记录")
                else:
                    from sqlalchemy import and_
                    from models.tls_certificate import TLSCertificate
                    from datetime import datetime
                    
                    with app.database_repo.db_session.get_session() as session:
                        # 根据 domain + source='auto' + store 查询
                        existing = session.query(TLSCertificate).filter(
                            and_(
                                TLSCertificate.domain == domain,
                                TLSCertificate.source == CertificateSource.AUTO.value,
                                TLSCertificate.store == store
                            )
                        ).first()
                        
                        if existing:
                            # 更新现有记录（复制原证书的所有字段，但 source 改为 AUTO）
                            existing.folder_name = folder_name
                            existing.certificate = certificate
                            existing.private_key = private_key
                            existing.sans = all_domains if all_domains else cert_detail.get("sans", [])
                            existing.issuer = cert_info.get("issuer") or cert_detail.get("issuer")
                            existing.not_before = cert_info.get("not_before") or cert_detail.get("not_before")
                            existing.not_after = cert_info.get("not_after") or cert_detail.get("not_after")
                            existing.is_valid = cert_info.get("is_valid") if cert_info.get("is_valid") is not None else cert_detail.get("is_valid", True)
                            existing.days_remaining = cert_info.get("days_remaining") if cert_info.get("days_remaining") is not None else cert_detail.get("days_remaining")
                            existing.status = CertificateStatus.SUCCESS.value
                            existing.email = cert_detail.get("email")  # 复制原证书的 email
                            existing.updated_at = datetime.now()
                            session.commit()
                            logger.debug(f"✅ 更新证书记录: domain={domain}, store={store}, source={CertificateSource.AUTO.value}, folder_name={folder_name}")
                        else:
                            # 创建新记录（复制原证书的所有字段，但 source 改为 AUTO）
                            new_cert = TLSCertificate(
                                store=store,  # 导出的 store
                                domain=domain,
                                folder_name=folder_name,
                                certificate=certificate,
                                private_key=private_key,
                                source=CertificateSource.AUTO.value,  # source 改为 AUTO
                                status=CertificateStatus.SUCCESS.value,
                                sans=all_domains if all_domains else cert_detail.get("sans", []),
                                issuer=cert_info.get("issuer") or cert_detail.get("issuer"),
                                not_before=cert_info.get("not_before") or cert_detail.get("not_before"),
                                not_after=cert_info.get("not_after") or cert_detail.get("not_after"),
                                is_valid=cert_info.get("is_valid") if cert_info.get("is_valid") is not None else cert_detail.get("is_valid", True),
                                days_remaining=cert_info.get("days_remaining") if cert_info.get("days_remaining") is not None else cert_detail.get("days_remaining"),
                                email=cert_detail.get("email")  # 复制原证书的 email
                            )
                            session.add(new_cert)
                            session.commit()
                            logger.debug(f"✅ 创建新证书记录: domain={domain}, store={store}, source={CertificateSource.AUTO.value}, folder_name={folder_name}")
            except Exception as e:
                logger.error(f"❌ 创建/更新证书记录失败: {e}", exc_info=True)
                # 不影响导出操作，记录错误但继续执行
        
        return {
            "success": True,
            "message": f"Successfully exported certificate for {domain} to {store}/{folder_name}",
            "store": store,
            "folder_name": folder_name,
            "domain": domain,
            "certificate_id": certificate_id
        }
        
    except Exception as e:
        logger.error(f"❌ 导出证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error exporting certificate: {str(e)}",
            "certificate_id": certificate_id,
            "store": store
        }
