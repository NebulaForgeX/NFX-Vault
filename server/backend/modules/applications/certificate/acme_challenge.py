# coding=utf-8

"""
ACME HTTP-01 挑战处理

处理 Let's Encrypt HTTP-01 挑战请求
"""
import logging
import os
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class ACMEChallengeStorage:
    """ACME HTTP-01 挑战存储（使用文件系统）"""
    
    def __init__(self, challenge_dir: str = "/tmp/acme-challenges"):
        """
        初始化挑战存储
        
        Args:
            challenge_dir: 挑战文件存储目录
        """
        self.challenge_dir = challenge_dir
        # Certbot webroot 模式会在 challenge_dir/.well-known/acme-challenge/ 创建文件
        os.makedirs(self.challenge_dir, exist_ok=True)
        os.makedirs(os.path.join(self.challenge_dir, ".well-known", "acme-challenge"), exist_ok=True)
        logger.info(f"📁 ACME challenge storage directory: {self.challenge_dir}")
    
    def store_challenge(self, token: str, key_authorization: str) -> bool:
        """
        存储挑战响应
        
        Args:
            token: ACME 挑战 token
            key_authorization: key authorization 值（token + "." + thumbprint）
        
        Returns:
            是否存储成功
        """
        try:
            challenge_file = os.path.join(self.challenge_dir, token)
            with open(challenge_file, 'w') as f:
                f.write(key_authorization)
            logger.debug(f"✅ Stored ACME challenge: token={token}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to store ACME challenge: {e}", exc_info=True)
            return False
    
    def get_challenge(self, token: str) -> Optional[str]:
        """
        获取挑战响应
        
        Certbot webroot 模式会在 challenge_dir/.well-known/acme-challenge/{token} 创建文件
        所以我们需要检查这个路径
        
        Args:
            token: ACME 挑战 token
        
        Returns:
            key authorization 值，如果不存在则返回 None
        """
        try:
            # Certbot webroot 模式的文件路径
            challenge_file = os.path.join(self.challenge_dir, ".well-known", "acme-challenge", token)
            
            logger.debug(f"🔍 Looking for challenge file: {challenge_file}")
            logger.debug(f"📁 Challenge directory exists: {os.path.exists(self.challenge_dir)}")
            logger.debug(f"📁 .well-known directory exists: {os.path.exists(os.path.join(self.challenge_dir, '.well-known'))}")
            logger.debug(f"📁 acme-challenge directory exists: {os.path.exists(os.path.join(self.challenge_dir, '.well-known', 'acme-challenge'))}")
            
            if os.path.exists(challenge_file):
                logger.info(f"✅ Found challenge file: {challenge_file}")
                with open(challenge_file, 'r') as f:
                    content = f.read().strip()
                    logger.debug(f"📄 Challenge content length: {len(content)}")
                    return content
            
            # 如果不存在，也尝试直接路径（兼容旧逻辑）
            fallback_file = os.path.join(self.challenge_dir, token)
            logger.debug(f"🔍 Trying fallback path: {fallback_file}")
            if os.path.exists(fallback_file):
                logger.info(f"✅ Found challenge file (fallback): {fallback_file}")
                with open(fallback_file, 'r') as f:
                    content = f.read().strip()
                    logger.debug(f"📄 Challenge content length: {len(content)}")
                    return content
            
            # 列出目录内容以便调试
            try:
                challenge_dir = os.path.join(self.challenge_dir, ".well-known", "acme-challenge")
                if os.path.exists(challenge_dir):
                    files = os.listdir(challenge_dir)
                    logger.warning(f"⚠️ Challenge directory contents: {files}")
                else:
                    logger.warning(f"⚠️ Challenge directory does not exist: {challenge_dir}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to list challenge directory: {e}")
            
            logger.warning(f"⚠️ Challenge file not found: {challenge_file} (also tried: {fallback_file})")
            return None
        except Exception as e:
            logger.error(f"❌ Failed to get ACME challenge: {e}", exc_info=True)
            return None
    
    def remove_challenge(self, token: str) -> bool:
        """
        删除挑战响应（验证完成后）
        
        Args:
            token: ACME 挑战 token
        
        Returns:
            是否删除成功
        """
        try:
            challenge_file = os.path.join(self.challenge_dir, token)
            if os.path.exists(challenge_file):
                os.remove(challenge_file)
                logger.debug(f"✅ Removed ACME challenge: token={token}")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Failed to remove ACME challenge: {e}", exc_info=True)
            return False

