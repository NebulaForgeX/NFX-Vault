# coding=utf-8

"""
读取并存储证书 Handler
"""
import logging
import os
import json
import base64
from typing import Dict, Any

from .protocol import CertificateAppLike
from utils.certificate import extract_cert_info_from_pem
from enums.certificate_source import CertificateSource
from enums.certificate_status import CertificateStatus

logger = logging.getLogger(__name__)


async def read_and_store_certificates(
    app: CertificateAppLike,
    store: str,
    trigger: str = "manual"
) -> Dict[str, Any]:
    """
    读取证书文件并存储到数据库（实际执行读取和处理）
    
    Args:
        app: CertificateApplication 实例
        store: 存储位置（websites 或 apis）
        trigger: 触发来源（manual, scheduled, api, startup, event）
        
    Returns:
        处理结果字典
    """
    cert_file_path = os.path.join(app.base_dir, store.capitalize(), "acme.json")
    
    if not os.path.exists(cert_file_path):
        return {
            "success": False,
            "message": f"ACME file not found: {cert_file_path}",
            "processed": 0
        }
    
    try:
        # 读取 acme.json
        with open(cert_file_path, 'r') as f:
            acme_data = json.load(f)
        
        # 提取证书（Traefik v3 使用 .letsencrypt.Certificates）
        letsencrypt_data = acme_data.get('letsencrypt', {})
        certificates_data = letsencrypt_data.get('Certificates', []) or acme_data.get('Certificates', [])
        
        # 提取 Account.Email（账户级别的邮箱，用于所有证书）
        account_data = letsencrypt_data.get('Account', {})
        account_email = account_data.get('Email', '')
        
        if not certificates_data:
            logger.warning(f"⚠️  acme.json 中没有找到证书数据: {cert_file_path}")
            return {
                "success": True,
                "message": f"No certificates found in {store}",
                "processed": 0
            }
        
        # 处理每个证书（使用 upsert，因为 domain + source 是唯一的）
        processed_count = 0
        failed_count = 0
        for cert_data in certificates_data:
            try:
                await _process_certificate(app, cert_data, store, account_email)
                processed_count += 1
            except Exception as e:
                logger.error(f"❌ 处理证书失败: {e}", exc_info=True)
                failed_count += 1
                continue
        
        # 发布缓存失效事件（通过 Kafka）
        # 注意：如果 trigger 是 "event"（来自 Kafka），则不再发送事件，避免无限循环
        if trigger != "event":
            app.invalidate_cache([store], trigger=trigger)
        
        # 发送 Kafka 事件（通知前端刷新缓存）
        # 注意：如果 trigger 是 "event"（来自 Kafka），则不再发送事件，避免无限循环
        if app.pipeline_repo and trigger != "event":
            app.pipeline_repo.send_refresh_event(store, trigger)
        
        logger.info(f"✅ 证书读取和存储完成: store={store}, 成功={processed_count}, 失败={failed_count}")
        return {
            "success": True,
            "message": f"Successfully processed {processed_count} certificates from {store}",
            "processed": processed_count
        }
        
    except Exception as e:
        logger.error(f"❌ 读取 acme.json 失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error reading acme.json: {str(e)}",
            "processed": 0
        }


async def _process_certificate(app: CertificateAppLike, cert_data: Dict, store: str, email: str = ''):
    """处理单个证书数据"""
    # 提取域名信息
    domain_obj = cert_data.get('domain', {})
    main_domain = domain_obj.get('main', '')
    sans = domain_obj.get('sans', [])
    
    if not main_domain:
        return
    
    # 解码证书和私钥
    cert_b64 = cert_data.get('certificate', '')
    key_b64 = cert_data.get('key', '')
    
    if not cert_b64 or not key_b64:
        return
    
    cert_pem_bytes = base64.b64decode(cert_b64)
    key_pem_bytes = base64.b64decode(key_b64)
    cert_pem = cert_pem_bytes.decode('utf-8')
    key_pem = key_pem_bytes.decode('utf-8')
    
    # 使用 openssl 提取证书信息
    cert_info = await extract_cert_info_from_pem(cert_pem)
    
    # 创建或更新证书（source='acme' 表示从 acme.json 读取，status='success' 表示已成功申请）
    app.database_repo.create_or_update_certificate(
        store=store,
        domain=main_domain,
        certificate=cert_pem,
        private_key=key_pem,
        source=CertificateSource.ACME.value,
        status=CertificateStatus.SUCCESS.value,  # 从 acme.json 读取的证书都是成功申请的
        email=email if email else None,  # 从 Account.Email 获取的邮箱
        sans=sans,
        issuer=cert_info.get("issuer", "Let's Encrypt"),
        not_before=cert_info.get("not_before"),
        not_after=cert_info.get("not_after"),
        is_valid=cert_info.get("is_valid", True),
        days_remaining=cert_info.get("days_remaining")
    )

