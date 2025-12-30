# coding=utf-8

"""
TLS 证书申请 Repository

使用 Certbot 自动申请 Let's Encrypt 证书
"""
import logging
from typing import Dict, Any, Optional, List

from resources.certbot.client import CertbotClient
from enums.certificate_status import CertificateStatus
from modules.configs.types import CertConfig

logger = logging.getLogger(__name__)


class TLSCertificateRepository:
    """TLS 证书申请仓库"""
    
    def __init__(self, cert_config: CertConfig, certbot_client: Optional[CertbotClient] = None):
        """
        初始化 TLS 证书申请仓库
        
        Args:
            cert_config: 证书管理配置对象（必需）
            certbot_client: Certbot 证书申请客户端实例（可选，默认从 cert_config 创建）
        """
        # 从配置对象创建 CertbotClient，所有参数必须传入
        self.certbot_client = certbot_client or CertbotClient(
            challenge_dir=cert_config.ACME_CHALLENGE_DIR,
            certs_dir=cert_config.BASE_DIR,
            max_wait_time=cert_config.CERT_MAX_WAIT_TIME
        )
    
    def apply_certificate(
        self,
        domain: str,
        email: str,
        sans: Optional[List[str]] = None,
        webroot: Optional[str] = None,  # 保留此参数以保持接口兼容，但实际使用 challenge_dir
        folder_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        使用 Certbot 申请 Let's Encrypt 证书
        
        Args:
            domain: 主域名
            email: 邮箱地址（用于 Let's Encrypt 通知）
            sans: SANs 列表（可选）
            webroot: Webroot 路径（保留以保持接口兼容，但实际使用 challenge_dir）
            folder_name: 证书存储文件夹名称（可选，默认使用域名）
        
        Returns:
            包含 success, message, certificate, private_key, status, error 的字典
        """
        try:
            # 调用 Certbot 客户端申请证书
            result = self.certbot_client.issue_certificate(
                domain=domain,
                email=email,
                sans=sans,
                folder_name=folder_name
            )
            
            # 确保状态字段存在
            if "status" not in result:
                if result.get("success"):
                    result["status"] = CertificateStatus.SUCCESS.value
                else:
                    result["status"] = CertificateStatus.FAIL.value
            
            return result
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ 申请证书异常: domain={domain}, error={error_msg}", exc_info=True)
            return {
                "success": False,
                "message": f"Error applying certificate: {error_msg}",
                "certificate": None,
                "private_key": None,
                "status": CertificateStatus.FAIL.value,
                "error": error_msg
            }

