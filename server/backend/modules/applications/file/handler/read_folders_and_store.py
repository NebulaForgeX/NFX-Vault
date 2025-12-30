# coding=utf-8

"""
读取文件夹并存储证书 Handler

从 Certs/Websites 和 Certs/Apis 文件夹读取证书文件并存储到数据库
"""
import logging
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

from .protocol import FileAppLike
from utils.certificate import extract_cert_info_from_pem_sync
from enums.certificate_source import CertificateSource
from enums.certificate_status import CertificateStatus
from enums.certificate_store import CertificateStore

logger = logging.getLogger(__name__)


async def read_folders_and_store_certificates(
    app: FileAppLike,
    store: str
) -> Dict[str, Any]:
    """
    读取文件夹中的证书文件并存储到数据库
    
    Args:
        app: FileApplication 实例
        store: 存储位置（websites 或 apis）
        
    Returns:
        处理结果字典
    """
    if not app.database_repo:
        logger.error("❌ 数据库仓库未初始化，无法读取文件夹")
        return {
            "success": False,
            "message": "Database repository not initialized",
            "processed": 0
        }
    
    base_dir = app.base_dir
    store_dir = os.path.join(base_dir, store.capitalize())
    
    if not os.path.exists(store_dir):
        logger.warning(f"⚠️  目录不存在: {store_dir}")
        return {
            "success": True,
            "message": f"Directory not found: {store_dir}",
            "processed": 0
        }
    
    try:
        processed_count = 0
        failed_count = 0
        
        # 遍历目录下的所有子文件夹
        for folder_name in os.listdir(store_dir):
            folder_path = os.path.join(store_dir, folder_name)
            
            # 跳过非目录
            if not os.path.isdir(folder_path):
                continue
            
            # 跳过隐藏文件夹
            if folder_name.startswith('.'):
                continue
            
            # 检查证书文件是否存在
            cert_file = os.path.join(folder_path, "cert.crt")
            key_file = os.path.join(folder_path, "key.key")
            
            if not os.path.exists(cert_file) or not os.path.exists(key_file):
                continue
            
            try:
                # 读取证书和私钥
                with open(cert_file, 'r') as f:
                    cert_pem = f.read()
                
                with open(key_file, 'r') as f:
                    key_pem = f.read()
                
                # 提取证书信息
                cert_info = extract_cert_info_from_pem_sync(cert_pem)
                
                # 从证书中提取域名
                domain = cert_info.get("common_name") or cert_info.get("subject", {}).get("CN", "")
                if not domain:
                    # 如果无法从证书提取，尝试从文件夹名推断（但这不是可靠的方法）
                    logger.warning(f"⚠️  无法从证书提取域名，跳过: {folder_name}")
                    continue
                
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
                
                # 检查数据库中是否已存在（根据 folder_name）
                existing = app.database_repo.get_certificate_by_folder_name(folder_name)
                
                if existing:
                    # 更新现有记录（保持原有 source）
                    app.database_repo.update_certificate_by_folder_name(
                        folder_name=folder_name,
                        store=store,
                        domain=domain,
                        certificate=cert_pem,
                        private_key=key_pem,
                        sans=all_domains if all_domains else [],
                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                        not_before=cert_info.get("not_before"),
                        not_after=cert_info.get("not_after"),
                        is_valid=cert_info.get("is_valid", True),
                        days_remaining=cert_info.get("days_remaining"),
                        status=CertificateStatus.SUCCESS.value
                    )
                else:
                    # 创建新记录（source='auto'）
                    app.database_repo.create_certificate_with_folder(
                        store=store,
                        domain=domain,
                        folder_name=folder_name,
                        certificate=cert_pem,
                        private_key=key_pem,
                        source=CertificateSource.AUTO.value,
                        status=CertificateStatus.SUCCESS.value,
                        sans=all_domains if all_domains else [],
                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                        not_before=cert_info.get("not_before"),
                        not_after=cert_info.get("not_after"),
                        is_valid=cert_info.get("is_valid", True),
                        days_remaining=cert_info.get("days_remaining")
                    )
                
                processed_count += 1
                
            except Exception as e:
                logger.error(f"❌ 处理证书失败: folder_name={folder_name}, error={e}", exc_info=True)
                failed_count += 1
                continue
        
        logger.info(f"✅ 文件夹读取和存储完成: store={store}, 成功={processed_count}, 失败={failed_count}")
        return {
            "success": True,
            "message": f"Successfully processed {processed_count} certificates from {store} folders",
            "processed": processed_count
        }
        
    except Exception as e:
        logger.error(f"❌ 读取文件夹失败: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error reading folders: {str(e)}",
            "processed": 0
        }

