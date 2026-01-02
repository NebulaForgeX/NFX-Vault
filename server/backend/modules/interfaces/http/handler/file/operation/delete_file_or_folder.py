# coding=utf-8

"""
删除文件或文件夹 Operation

注意：此操作通过发送 Kafka 事件来删除文件/文件夹，而不是直接删除
"""
import logging
from typing import Optional
from modules.applications.file import FileApplication
from modules.interfaces.http.dto.reqdto.file import DeleteFileOrFolderRequest
from modules.repositories.pipeline.certificate import CertificatePipeline

logger = logging.getLogger(__name__)


def delete_file_or_folder(
    app: FileApplication,
    request: DeleteFileOrFolderRequest,
    pipeline_repo: Optional[CertificatePipeline] = None
):
    """
    删除文件或文件夹（通过发送 Kafka 事件）
    
    Args:
        app: FileApplication 实例
        request: 删除文件或文件夹请求 DTO
        pipeline_repo: Pipeline 仓库（用于发送 Kafka 事件）
    
    Returns:
        删除结果
    """
    if not pipeline_repo:
        return {
            "success": False,
            "message": "Pipeline repository not available, cannot send delete event"
        }
    
    # 发送 Kafka 事件
    success = pipeline_repo.send_delete_file_or_folder_event(
        store=request.store,
        path=request.path,
        item_type=request.item_type
    )
    
    if success:
        return {
            "success": True,
            "message": f"Delete event sent for {request.item_type}: {request.store}/{request.path}"
        }
    else:
        return {
            "success": False,
            "message": f"Failed to send delete event for {request.item_type}: {request.store}/{request.path}"
        }
