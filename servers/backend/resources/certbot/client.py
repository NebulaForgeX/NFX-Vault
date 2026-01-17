# coding=utf-8

"""
Certbot 证书申请客户端

使用 certbot 自动申请 Let's Encrypt 证书
"""
import logging
import subprocess
import os
import time
import re
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class CertbotClient:
    """Certbot 证书申请客户端"""
    
    def __init__(
        self,
        challenge_dir: str,
        certs_dir: str,
        max_wait_time: int
    ):
        """
        初始化 Certbot 客户端
        
        所有参数必须传入，不允许默认值
        
        Args:
            challenge_dir: ACME 挑战文件存储目录（必需）
            certs_dir: 证书存储根目录（必需）
            max_wait_time: 最大等待时间（秒）（必需）
        """
        if not challenge_dir:
            raise ValueError("challenge_dir is required")
        if not certs_dir:
            raise ValueError("certs_dir is required")
        if not isinstance(max_wait_time, int) or max_wait_time <= 0:
            raise ValueError(f"max_wait_time must be a positive integer, got: {max_wait_time}")
        
        self.challenge_dir = challenge_dir
        self.certs_dir = certs_dir
        self.max_wait_time = max_wait_time
        
        # 确保目录存在
        # Certbot webroot 模式会在 challenge_dir/.well-known/acme-challenge/ 创建文件
        os.makedirs(self.challenge_dir, exist_ok=True)
        os.makedirs(os.path.join(self.challenge_dir, ".well-known", "acme-challenge"), exist_ok=True)
        os.makedirs(self.certs_dir, exist_ok=True)
        
        logger.info(f"📁 Certbot client initialized")
        logger.info(f"📁 Challenge directory: {self.challenge_dir}")
        logger.info(f"📁 Certs directory: {self.certs_dir}")
        logger.info(f"⏱️ Max wait time: {self.max_wait_time}s")
    
    def _check_certificate_exists(
        self,
        folder_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        检查证书是否已存在且有效
        
        Args:
            folder_name: 证书存储文件夹名称
        
        Returns:
            如果证书存在且有效，返回包含 certificate 和 private_key 的字典；否则返回 None
        """
        try:
            custom_config_dir = os.path.join(self.certs_dir, ".certbot", "config")
            certbot_cert_dir = os.path.join(custom_config_dir, "live", folder_name)
            certbot_cert_file = os.path.join(certbot_cert_dir, "fullchain.pem")
            certbot_key_file = os.path.join(certbot_cert_dir, "privkey.pem")
            
            # 检查证书文件是否存在
            if not os.path.exists(certbot_cert_file) or not os.path.exists(certbot_key_file):
                return None
            
            # 读取证书内容
            with open(certbot_cert_file, 'r') as f:
                certificate = f.read()
            
            with open(certbot_key_file, 'r') as f:
                private_key = f.read()
            
            # 验证证书是否有效（使用 openssl 检查证书过期时间）
            try:
                result = subprocess.run(
                    ["openssl", "x509", "-in", certbot_cert_file, "-noout", "-checkend", "86400"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                # 如果命令成功（返回码为 0），说明证书至少还有 1 天有效期
                is_valid = result.returncode == 0
            except Exception:
                # 如果 openssl 不可用或出错，假设证书有效
                is_valid = True
            
            if certificate and private_key:
                logger.info(f"✅ Certificate already exists and is valid for folder '{folder_name}'")
                return {
                    "certificate": certificate,
                    "private_key": private_key,
                    "is_valid": is_valid
                }
            
            return None
        except Exception as e:
            logger.warning(f"⚠️ Failed to check existing certificate: {e}")
            return None
    
    def _is_rate_limit_error(self, error_msg: str) -> Tuple[bool, Optional[str]]:
        """
        检查错误信息是否包含速率限制错误
        
        Args:
            error_msg: 错误消息
        
        Returns:
            (是否是速率限制错误, 重试时间提示)
        """
        if not error_msg:
            return False, None
        
        # 匹配速率限制错误模式
        # "too many certificates (5) already issued for this exact set of identifiers in the last 168h0m0s, retry after 2026-01-18 16:49:07 UTC"
        rate_limit_pattern = r"too many certificates.*?retry after (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"
        match = re.search(rate_limit_pattern, error_msg, re.IGNORECASE)
        
        if match:
            retry_time = match.group(1)
            return True, retry_time
        
        return False, None
    
    def issue_certificate(
        self,
        domain: str,
        email: str,
        sans: Optional[List[str]] = None,
        folder_name: Optional[str] = None,
        force_renewal: bool = False
    ) -> Dict[str, Any]:
        """
        使用 certbot 申请 Let's Encrypt 证书
        
        Args:
            domain: 主域名
            email: 邮箱地址（用于 Let's Encrypt 通知）
            sans: SANs 列表（可选）
            folder_name: 证书存储文件夹名称（可选，默认使用域名）
            force_renewal: 是否强制更新证书（即使证书未过期也重新申请）
        
        Returns:
            包含 success, message, certificate, private_key, status, error 的字典
        """
        if not folder_name:
            # 使用域名作为文件夹名（替换 . 为 _）
            folder_name = domain.replace('.', '_')
        
        # 注意：申请证书时只保存到数据库，不创建 Websites/Apis 文件夹
        # 后续可以通过其他功能将 database 中的证书复制到 Websites/Apis 文件夹
        
        # 如果 force_renewal=False，先检查证书是否已存在且有效
        if not force_renewal:
            existing_cert = self._check_certificate_exists(folder_name)
            if existing_cert and existing_cert.get("is_valid", True):
                logger.info(f"✅ Using existing certificate for domain '{domain}' (force_renewal=False)")
                return {
                    "success": True,
                    "message": f"Certificate already exists and is valid for domain '{domain}'. Using existing certificate.",
                    "certificate": existing_cert["certificate"],
                    "private_key": existing_cert["private_key"],
                    "status": "success",
                    "error": None
                }
            elif existing_cert:
                logger.info(f"⚠️ Existing certificate for domain '{domain}' is expired or will expire soon. Will request new certificate.")
            else:
                logger.info(f"ℹ️ No existing certificate found for domain '{domain}'. Will request new certificate.")
        
        try:
            # 构建 certbot 命令
            # 使用 standalone 模式，监听 80 端口进行 HTTP-01 验证
            # 但我们需要使用 webroot 模式，因为 Traefik 会转发挑战请求
            
            # 构建域名列表
            domains = [domain]
            if sans:
                domains.extend(sans)
            
            # 使用 certbot certonly 命令
            # --webroot: 使用 webroot 模式
            # --webroot-path: 指定 webroot 路径（ACME 挑战文件存储目录）
            # --email: 邮箱地址
            # --agree-tos: 同意服务条款
            # --non-interactive: 非交互模式
            # --cert-name: 证书名称（使用 folder_name）
            # --config-dir: 自定义配置目录（避免写入 /etc/letsencrypt/）
            # --work-dir: 自定义工作目录（避免写入 /var/lib/letsencrypt/）
            # -d: 域名列表
            
            # 使用自定义目录，避免写入 /etc/letsencrypt/（这样 Traefik 不会自动使用）
            custom_config_dir = os.path.join(self.certs_dir, ".certbot", "config")
            custom_work_dir = os.path.join(self.certs_dir, ".certbot", "work")
            custom_logs_dir = os.path.join(self.certs_dir, ".certbot", "logs")
            os.makedirs(custom_config_dir, exist_ok=True)
            os.makedirs(custom_work_dir, exist_ok=True)
            os.makedirs(custom_logs_dir, exist_ok=True)
            
            cmd = [
                "certbot",
                "certonly",
                "--webroot",
                "--webroot-path", self.challenge_dir,
                "--email", email,
                "--agree-tos",
                "--non-interactive",
                "--cert-name", folder_name,
                "--config-dir", custom_config_dir,
                "--work-dir", custom_work_dir,
                "--logs-dir", custom_logs_dir,
            ]
            
            # 如果强制更新，添加 --force-renewal 参数
            if force_renewal:
                cmd.append("--force-renewal")
                logger.info(f"🔄 Force renewal enabled for domain '{domain}'")
            
            # 添加域名
            for d in domains:
                cmd.extend(["-d", d])
            
            logger.info(f"🚀 Starting certbot certificate application: domain={domain}, folder={folder_name}")
            logger.debug(f"📝 Certbot command: {' '.join(cmd)}")
            logger.info(f"📁 Challenge directory: {self.challenge_dir}")
            logger.info(f"📁 Challenge path: {os.path.join(self.challenge_dir, '.well-known', 'acme-challenge')}")
            
            # 确保 challenge 目录存在且可写
            challenge_path = os.path.join(self.challenge_dir, ".well-known", "acme-challenge")
            os.makedirs(challenge_path, exist_ok=True)
            logger.info(f"✅ Challenge directory ready: {challenge_path}")
            
            # 执行 certbot 命令
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.max_wait_time
            )
            
            # 检查 challenge 目录中是否有文件（用于调试）
            if os.path.exists(challenge_path):
                challenge_files = os.listdir(challenge_path)
                logger.info(f"📋 Challenge files after certbot: {challenge_files}")
            else:
                logger.warning(f"⚠️ Challenge directory does not exist: {challenge_path}")
            
            if result.returncode != 0:
                # 输出更详细的错误信息
                error_output = result.stderr or result.stdout or ""
                logger.error(f"❌ Certbot failed (returncode={result.returncode})")
                logger.error(f"❌ Certbot stderr: {result.stderr}")
                logger.error(f"❌ Certbot stdout: {result.stdout}")
                
                # 检查是否是速率限制错误
                is_rate_limit, retry_time = self._is_rate_limit_error(error_output)
                
                if is_rate_limit:
                    # 如果是速率限制错误，且 force_renewal=False，尝试使用现有证书
                    if not force_renewal:
                        existing_cert = self._check_certificate_exists(folder_name)
                        if existing_cert:
                            logger.warning(f"⚠️ Rate limit reached, but using existing certificate for domain '{domain}'")
                            return {
                                "success": True,
                                "message": f"Rate limit reached for domain '{domain}', but using existing certificate. New certificate can be requested after {retry_time} UTC.",
                                "certificate": existing_cert["certificate"],
                                "private_key": existing_cert["private_key"],
                                "status": "success",
                                "error": None,
                                "warning": f"Rate limit reached. New certificate can be requested after {retry_time} UTC."
                            }
                    
                    # 如果是速率限制错误且 force_renewal=True，或者没有现有证书，返回明确的错误信息
                    error_msg = f"Let's Encrypt rate limit reached: too many certificates (5) already issued for this exact set of identifiers in the last 168 hours. Retry after {retry_time} UTC. See https://letsencrypt.org/docs/rate-limits/ for details."
                    logger.error(f"❌ {error_msg}")
                    return {
                        "success": False,
                        "message": error_msg,
                        "certificate": None,
                        "private_key": None,
                        "status": "fail",
                        "error": error_msg,
                        "rate_limit": True,
                        "retry_after": retry_time
                    }
                
                # 其他错误
                error_msg = error_output
                return {
                    "success": False,
                    "message": f"Certbot certificate application failed: {error_msg}",
                    "certificate": None,
                    "private_key": None,
                    "status": "fail",
                    "error": error_msg
                }
            
            # Certbot 将证书存储在自定义配置目录的 live/{cert-name}/
            # 我们需要复制到目标目录
            certbot_cert_dir = os.path.join(custom_config_dir, "live", folder_name)
            certbot_cert_file = os.path.join(certbot_cert_dir, "fullchain.pem")
            certbot_key_file = os.path.join(certbot_cert_dir, "privkey.pem")
            
            # 检查证书文件是否存在
            if not os.path.exists(certbot_cert_file) or not os.path.exists(certbot_key_file):
                error_msg = f"Certificate files not found in {certbot_cert_dir}"
                logger.error(f"❌ {error_msg}")
                return {
                    "success": False,
                    "message": error_msg,
                    "certificate": None,
                    "private_key": None,
                    "status": "fail",
                    "error": error_msg
                }
            
            # 读取证书和私钥（只读取，不保存到文件）
            # 证书内容将保存到数据库，不创建 Websites/Apis 文件夹
            with open(certbot_cert_file, 'r') as f:
                certificate = f.read()
            
            with open(certbot_key_file, 'r') as f:
                private_key = f.read()
            
            logger.info(f"✅ Certificate issued successfully: domain={domain}, folder={folder_name}")
            logger.info(f"📄 Certificate content read (will be saved to database only)")
            
            return {
                "success": True,
                "message": f"Certificate issued successfully for domain '{domain}'",
                "certificate": certificate,
                "private_key": private_key,
                "status": "success",
                "error": None
            }
        
        except subprocess.TimeoutExpired:
            error_msg = f"Certbot command timeout after {self.max_wait_time}s"
            logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "message": error_msg,
                "certificate": None,
                "private_key": None,
                "status": "fail",
                "error": error_msg
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Certificate application failed: {error_msg}", exc_info=True)
            return {
                "success": False,
                "message": f"Error applying certificate: {error_msg}",
                "certificate": None,
                "private_key": None,
                "status": "fail",
                "error": error_msg
            }

