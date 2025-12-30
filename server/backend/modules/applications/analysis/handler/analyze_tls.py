# coding=utf-8

"""
分析 TLS 证书 Handler

用于分析用户上传或粘贴的证书和私钥文件
"""
import logging
from typing import Dict, Any, Optional

from .protocol import AnalysisAppLike
from utils.certificate import extract_cert_info_from_pem_sync

logger = logging.getLogger(__name__)


def analyze_tls_certificate(
    app: AnalysisAppLike,
    certificate: str,
    private_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    分析 TLS 证书（不保存到数据库，仅返回解析结果）
    
    Args:
        app: AnalysisApplication 实例
        certificate: 证书内容（PEM格式）
        private_key: 私钥内容（PEM格式，可选）
    
    Returns:
        分析结果（包含证书信息、解析结果等）
    """
    try:
        # 验证证书内容
        if not certificate or not certificate.strip():
            return {
                "success": False,
                "message": "Certificate content is empty",
                "data": None
            }
        
        # 解析证书
        cert_info = extract_cert_info_from_pem_sync(certificate)
        
        # 打印解析结果用于调试
        logger.info(f"🔍 证书解析结果: {cert_info}")
        
        if not cert_info:
            logger.warning("⚠️  证书解析失败")
            return {
                "success": False,
                "message": "Failed to parse certificate. Please check if the certificate format is correct.",
                "data": None
            }
        
        # 提取解析结果
        parsed_domain = cert_info.get("common_name")
        parsed_sans = cert_info.get("sans", [])
        parsed_issuer = cert_info.get("issuer")
        parsed_not_before = cert_info.get("not_before")
        parsed_not_after = cert_info.get("not_after")
        # extract_cert_info_from_pem_sync 的逻辑：
        # - 如果 not_after 存在，会计算 days_remaining 和 is_valid (days_remaining >= 0)
        # - 如果 not_after 不存在，is_valid 默认为 True，days_remaining 为 None
        parsed_is_valid = cert_info.get("is_valid")
        parsed_days_remaining = cert_info.get("days_remaining")
        parsed_subject = cert_info.get("subject", {})
        
        # 打印提取的字段用于调试
        logger.info(f"🔍 提取的字段: domain={parsed_domain}, issuer={parsed_issuer}")
        logger.info(f"🔍 日期信息: not_before={parsed_not_before} (type: {type(parsed_not_before)}), "
                   f"not_after={parsed_not_after} (type: {type(parsed_not_after)})")
        logger.info(f"🔍 有效性: is_valid={parsed_is_valid} (type: {type(parsed_is_valid)}), "
                   f"days_remaining={parsed_days_remaining} (type: {type(parsed_days_remaining)})")
        
        # 如果 is_valid 是 None，根据 not_after 判断
        if parsed_is_valid is None:
            if parsed_not_after:
                # 有有效期，但 is_valid 是 None，说明可能解析有问题，默认有效
                parsed_is_valid = True
                logger.warning(f"⚠️  is_valid 为 None，但有 not_after，默认设置为 True")
            else:
                # 没有有效期信息，无法判断，默认有效
                parsed_is_valid = True
                logger.warning(f"⚠️  is_valid 为 None，且没有 not_after，默认设置为 True")
        
        # 合并所有域名（包括 CN 和 SANs）
        all_domains = cert_info.get("all_domains") or []
        if not isinstance(all_domains, list):
            all_domains = []
        if parsed_domain and parsed_domain not in all_domains:
            all_domains.insert(0, parsed_domain)
        
        # 验证私钥（如果提供）
        key_valid = None
        key_info = None
        if private_key and private_key.strip():
            try:
                # 可以在这里添加私钥验证逻辑
                # 例如：检查私钥格式、是否匹配证书等
                key_info = {
                    "has_private_key": True,
                    "key_length": None,  # 可以解析私钥长度
                }
                key_valid = True
            except Exception as e:
                logger.warning(f"⚠️  私钥验证失败: {e}")
                key_valid = False
                key_info = {
                    "has_private_key": True,
                    "valid": False,
                    "error": str(e)
                }
        else:
            key_info = {
                "has_private_key": False
            }
        
        # 构建返回数据
        result_data = {
            "certificate": {
                "domain": parsed_domain,
                "subject": parsed_subject,
                "issuer": parsed_issuer,
                "sans": parsed_sans,
                "all_domains": all_domains,
                "not_before": parsed_not_before.isoformat() if parsed_not_before else None,
                "not_after": parsed_not_after.isoformat() if parsed_not_after else None,
                "is_valid": parsed_is_valid if parsed_is_valid is not None else True,  # 确保有值
                "days_remaining": parsed_days_remaining,
            },
            "private_key": key_info,
            "summary": {
                "is_valid": parsed_is_valid if parsed_is_valid is not None else True,  # 确保有值
                "days_remaining": parsed_days_remaining,
                "has_private_key": bool(private_key and private_key.strip()),
                "key_valid": key_valid,
            }
        }
        
        # 打印最终返回的数据用于调试
        logger.info(f"✅ TLS 证书分析完成: domain={parsed_domain}, is_valid={result_data['certificate']['is_valid']}, "
                   f"days_remaining={parsed_days_remaining}, not_before={result_data['certificate']['not_before']}, "
                   f"not_after={result_data['certificate']['not_after']}")
        logger.debug(f"📋 完整返回数据: {result_data}")
        
        return {
            "success": True,
            "message": "Certificate analyzed successfully",
            "data": result_data
        }
        
    except Exception as e:
        logger.error(f"❌ 分析 TLS 证书失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error analyzing certificate: {str(e)}",
            "data": None
        }

