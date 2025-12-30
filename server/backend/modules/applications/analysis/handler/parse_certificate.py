# coding=utf-8

"""
解析证书 Handler

从 TLS handler 移动到 Analysis handler
"""
import logging
from typing import Dict, Any, Optional

from modules.applications.tls.handler.protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_status import CertificateStatus

logger = logging.getLogger(__name__)


def parse_certificate(
    app: CertificateAppLike,
    certificate_id: str
) -> Dict[str, Any]:
    """
    解析证书内容并更新数据库
    
    Args:
        app: CertificateApplication 实例
        certificate_id: 证书 ID
    
    Returns:
        解析结果（包含 success, message 等）
    """
    try:
        from enums.certificate_store import CertificateStore
        
        # 从数据库获取证书
        cert_obj = app.database_repo.get_certificate_by_id(certificate_id)
        if not cert_obj:
            logger.error(f"❌ 证书不存在: certificate_id={certificate_id}")
            return {
                "success": False,
                "message": f"Certificate not found: {certificate_id}"
            }
        
        # 检查证书内容是否存在
        if not cert_obj.get("certificate"):
            logger.error(f"❌ 证书内容为空: certificate_id={certificate_id}")
            # 证书为空，更新状态为 FAIL
            app.database_repo.update_certificate_parse_result(
                certificate_id=certificate_id,
                status=CertificateStatus.FAIL.value,
                sans=None,
                issuer=None,
                not_before=None,
                not_after=None,
                is_valid=False,
                days_remaining=0
            )
            return {
                "success": False,
                "message": "Certificate content is empty"
            }
        
        # 解析证书
        cert_info = extract_cert_info_from_pem_sync(cert_obj["certificate"])
        
        if not cert_info:
            # 解析失败，更新状态为 fail，但保存基本信息
            app.database_repo.update_certificate_parse_result(
                certificate_id=certificate_id,
                status=CertificateStatus.FAIL.value,
                sans=None,
                issuer=None,
                not_before=None,
                not_after=None,
                is_valid=False,
                days_remaining=0
            )
            logger.warning(f"⚠️  证书解析失败: certificate_id={certificate_id}")
            return {
                "success": False,
                "message": "Failed to parse certificate"
            }
        
        # 提取解析结果
        parsed_domain = cert_info.get("common_name")
        parsed_sans = cert_info.get("sans", [])
        parsed_issuer = cert_info.get("issuer")
        parsed_not_before = cert_info.get("not_before")
        parsed_not_after = cert_info.get("not_after")
        parsed_is_valid = cert_info.get("is_valid", False)
        parsed_days_remaining = cert_info.get("days_remaining")
        
        # 合并所有域名（包括 CN 和 SANs）
        all_domains = cert_info.get("all_domains", [])
        if not isinstance(all_domains, list):
            all_domains = []
        # 确保 parsed_domain 在列表中
        if parsed_domain and parsed_domain not in all_domains:
            all_domains.insert(0, parsed_domain)
        # 确保所有 SANs 都在列表中
        if parsed_sans:
            for san in parsed_sans:
                if san and san not in all_domains:
                    all_domains.append(san)
        
        # 检查域名是否匹配
        original_domain = cert_obj.get("domain")
        domain_match = parsed_domain == original_domain if parsed_domain else False
        
        # 确定状态
        if domain_match and parsed_is_valid:
            status = CertificateStatus.SUCCESS.value
        else:
            status = CertificateStatus.FAIL.value
            if not domain_match:
                logger.warning(f"⚠️  域名不匹配: original={original_domain}, parsed={parsed_domain}")
        
        # 更新数据库（无论成功还是失败，都保存解析结果）
        # 使用 all_domains 作为 sans（包含 CN 和所有 SANs）
        # 如果 all_domains 为空列表，也保存（表示没有 SANs）
        # 如果状态为 fail，days_remaining 设置为 None
        app.database_repo.update_certificate_parse_result(
            certificate_id=certificate_id,
            status=status,
            sans=all_domains if all_domains else [],  # 空列表而不是 None，表示没有 SANs
            issuer=parsed_issuer,
            not_before=parsed_not_before,
            not_after=parsed_not_after,
            is_valid=parsed_is_valid,
            days_remaining=0 if status == CertificateStatus.FAIL.value else parsed_days_remaining
        )
        
        # 发布缓存失效事件
        store = cert_obj.get("store", CertificateStore.DATABASE.value)
        app.invalidate_cache([store], trigger="parse")
        
        return {
            "success": status == CertificateStatus.SUCCESS.value,
            "message": f"Certificate parsed successfully" if status == CertificateStatus.SUCCESS.value else "Certificate parsed but validation failed",
            "domain_match": domain_match,
            "parsed_domain": parsed_domain,
            "original_domain": original_domain
        }
        
    except Exception as e:
        logger.error(f"❌ 解析证书失败: {e}", exc_info=True)
        # 即使解析失败，也尝试更新状态为 fail
        try:
            app.database_repo.update_certificate_parse_result(
                certificate_id=certificate_id,
                status=CertificateStatus.FAIL.value,
                sans=None,
                issuer=None,
                not_before=None,
                not_after=None,
                is_valid=False,
                days_remaining=0
            )
        except Exception as update_error:
            logger.error(f"❌ 更新证书状态失败: {update_error}")
        
        return {
            "success": False,
            "message": f"Error parsing certificate: {str(e)}"
        }

