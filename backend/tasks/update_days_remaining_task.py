# coding=utf-8

"""
更新证书剩余天数定时任务

每天定时更新所有证书的剩余天数和有效性状态
如果 source = auto 且 days_remaining < 10，则同步申请证书并发送 Kafka 事件
"""
import logging
from typing import Dict, Any

from enums.certificate_source import CertificateSource
from enums.certificate_store import CertificateStore
from enums.certificate_status import CertificateStatus

logger = logging.getLogger(__name__)


def update_days_remaining_job(
    database_repo,
    certificate_application=None,
    pipeline_repo=None
) -> Dict[str, Any]:
    """
    定时任务：更新所有证书的剩余天数
    
    如果 source = auto 且 days_remaining < 10，则同步申请证书并发送 Kafka 事件
    
    Args:
        database_repo: CertificateDatabase 实例
        certificate_application: CertificateApplication 实例（可选，用于申请证书）
        pipeline_repo: CertificatePipeline 实例（可选，用于发送 Kafka 事件）
    
    Returns:
        任务执行结果
    """
    try:
        updated_count, total_count, certificates = database_repo.update_all_days_remaining()
        logger.info(f"✅ 更新剩余天数任务完成: 更新 {updated_count}/{total_count} 个证书")
        
        # 检查需要重新申请的证书（source = auto 且 days_remaining < 10）
        need_reapply_count = 0
        reapply_success_count = 0
        reapply_failed_count = 0
        
        if certificate_application and pipeline_repo:
            for cert in certificates:
                source = cert.get("source")
                days_remaining = cert.get("days_remaining", 0)
                store = cert.get("store")
                certificate_id = cert.get("id")
                domain = cert.get("domain")
                email = cert.get("email")
                folder_name = cert.get("folder_name")
                
                # 检查条件：source = auto 且 days_remaining < 10
                if source == CertificateSource.AUTO.value and days_remaining < 10:
                    # auto 类型的证书不能存在 database store，如果存在就跳过并发出警告
                    if store == CertificateStore.DATABASE.value:
                        logger.warning(
                            f"⚠️  AUTO 类型的证书不能存在 database store，跳过申请: "
                            f"certificate_id={certificate_id}, domain={domain}, store={store}"
                        )
                        continue
                    
                    need_reapply_count += 1
                    logger.info(
                        f"🔄 检测到需要重新申请的证书: certificate_id={certificate_id}, "
                        f"domain={domain}, days_remaining={days_remaining}, store={store}"
                    )
                    
                    try:
                        # 同步申请证书（不使用后台线程）
                        # 获取原始证书信息
                        original_cert = database_repo.get_certificate_by_id(certificate_id)
                        if not original_cert:
                            logger.error(f"❌ 证书不存在: certificate_id={certificate_id}")
                            reapply_failed_count += 1
                            continue
                        
                        original_status = original_cert.get("status")
                        domain = original_cert.get("domain")
                        folder_name = original_cert.get("folder_name")
                        store = original_cert.get("store")
                        email = original_cert.get("email") or email
                        sans = original_cert.get("sans", [])
                        
                        if not email:
                            logger.error(f"❌ 证书邮箱为空，无法申请: certificate_id={certificate_id}, domain={domain}")
                            reapply_failed_count += 1
                            continue
                        
                        # 先更新状态为申请中
                        database_repo.update_certificate_by_id(
                            certificate_id=certificate_id,
                            status=CertificateStatus.PROCESS.value
                        )
                        
                        # 调用 TLS repository 申请证书（同步执行）
                        apply_result = certificate_application.tls_repo.apply_certificate(
                            domain=domain,
                            email=email,
                            sans=sans if isinstance(sans, list) else [],
                            folder_name=folder_name,
                            force_renewal=True  # 强制更新
                        )
                        
                        # 根据申请结果更新数据库状态
                        if apply_result.get("success"):
                            try:
                                from utils.certificate import extract_cert_info_from_pem_sync
                                
                                cert_pem = apply_result.get("certificate")
                                key_pem = apply_result.get("private_key")
                                
                                if cert_pem and key_pem:
                                    # 提取证书信息
                                    cert_info = extract_cert_info_from_pem_sync(cert_pem)
                                    
                                    # 更新数据库状态为成功
                                    database_repo.update_certificate_by_id(
                                        certificate_id=certificate_id,
                                        certificate=cert_pem,
                                        private_key=key_pem,
                                        status=CertificateStatus.SUCCESS.value,
                                        issuer=cert_info.get("issuer", "Let's Encrypt"),
                                        not_before=cert_info.get("not_before"),
                                        not_after=cert_info.get("not_after"),
                                        is_valid=cert_info.get("is_valid", True),
                                        days_remaining=cert_info.get("days_remaining"),
                                        email=cert_info.get("email") or email
                                    )
                                    
                                    logger.info(f"✅ 证书申请成功: certificate_id={certificate_id}, domain={domain}")
                                    
                                    # 发送 Kafka 事件，通知导出证书
                                    pipeline_repo.send_export_certificate_event(certificate_id)
                                    logger.info(f"✅ 已发送导出证书事件: certificate_id={certificate_id}")
                                    
                                    reapply_success_count += 1
                                else:
                                    logger.warning(f"⚠️  证书内容为空: certificate_id={certificate_id}")
                                    database_repo.update_certificate_by_id(
                                        certificate_id=certificate_id,
                                        status=original_status
                                    )
                                    reapply_failed_count += 1
                            except Exception as e:
                                logger.error(f"❌ 更新证书失败: certificate_id={certificate_id}, error={e}", exc_info=True)
                                # 恢复原始状态
                                database_repo.update_certificate_by_id(
                                    certificate_id=certificate_id,
                                    status=original_status
                                )
                                reapply_failed_count += 1
                        else:
                            error_msg = apply_result.get("error", "Unknown error")
                            logger.error(f"❌ 证书申请失败: certificate_id={certificate_id}, error={error_msg}")
                            # 恢复原始状态
                            database_repo.update_certificate_by_id(
                                certificate_id=certificate_id,
                                status=original_status
                            )
                            reapply_failed_count += 1
                    
                    except Exception as e:
                        logger.error(f"❌ 重新申请证书异常: certificate_id={certificate_id}, error={e}", exc_info=True)
                        reapply_failed_count += 1
        
        result = {
            "success": True,
            "message": f"Updated {updated_count}/{total_count} certificates",
            "updated": updated_count,
            "total": total_count
        }
        
        if need_reapply_count > 0:
            result["reapply"] = {
                "need_reapply": need_reapply_count,
                "success": reapply_success_count,
                "failed": reapply_failed_count
            }
            result["message"] += f", Reapplied {reapply_success_count}/{need_reapply_count} certificates"
        
        return result
    except Exception as e:
        logger.error(f"❌ 更新剩余天数任务失败: error={e}", exc_info=True)
        return {
            "success": False,
            "message": f"Error updating days remaining: {str(e)}",
            "updated": 0,
            "total": 0
        }
