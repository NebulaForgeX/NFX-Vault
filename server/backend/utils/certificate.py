# coding=utf-8

"""
证书应用层工具函数

共享的辅助函数
"""
import logging
import subprocess
import re
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)


async def extract_cert_info_from_pem(cert_pem: str) -> Dict:
    """
    从 PEM 格式证书中提取信息（异步版本）
    
    用于异步方法
    """
    try:
        result = subprocess.run(
            ['openssl', 'x509', '-noout', '-text', '-dates', '-subject', '-issuer'],
            input=cert_pem,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error(f"❌ OpenSSL 命令失败: {result.stderr}")
            return {}
        
        output = result.stdout
        
        not_before = None
        not_after = None
        issuer = "Let's Encrypt"  # 默认颁发者
        common_name = None
        subject = {}
        sans = []  # Subject Alternative Names
        
        # 提取 subject 信息（包含域名）
        subject_line = None
        for line in output.split('\n'):
            if 'subject=' in line or 'Subject:' in line:
                subject_line = line
                break
        
        if subject_line:
            # openssl 输出格式通常是：subject=C = US, CN = example.com
            # 提取 CN (Common Name) 字段作为域名
            cn_match = re.search(r'CN\s*=\s*([^,]+)', subject_line)
            if cn_match:
                common_name = cn_match.group(1).strip()
                subject["CN"] = common_name
        
        # 提取 SANs (Subject Alternative Names)
        # openssl 输出格式通常是：
        # X509v3 Subject Alternative Name:
        #     DNS:example.com, DNS:www.example.com, DNS:api.example.com
        in_san_section = False
        for line in output.split('\n'):
            if 'Subject Alternative Name' in line or 'X509v3 Subject Alternative Name' in line:
                in_san_section = True
                continue
            if in_san_section:
                # 提取 DNS: 开头的域名
                dns_matches = re.findall(r'DNS:\s*([^,\s]+)', line)
                sans.extend([dns.strip() for dns in dns_matches])
                # 如果遇到空行或下一个节，停止提取
                if line.strip() == '' or (line.strip() and not line.strip().startswith(' ') and ':' in line):
                    break
        
        # 提取 issuer 信息
        issuer_line = None
        for line in output.split('\n'):
            if 'issuer=' in line or 'Issuer:' in line:
                issuer_line = line
                break
        
        if issuer_line:
            # openssl 输出格式通常是：issuer=C = US, O = Let's Encrypt, CN = R3
            # 或：Issuer: C = US, O = Let's Encrypt, CN = R3
            # 优先提取 O (Organization) 字段
            org_match = re.search(r'O\s*=\s*([^,]+)', issuer_line)
            if org_match:
                issuer = org_match.group(1).strip()
            else:
                # 如果没有 O 字段，使用 CN (Common Name) 字段
                cn_match = re.search(r'CN\s*=\s*([^,]+)', issuer_line)
                if cn_match:
                    issuer = cn_match.group(1).strip()
        
        for line in output.split('\n'):
            if 'notBefore' in line:
                date_str = line.split('=')[1].strip()
                try:
                    not_before = datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    logger.warning(f"⚠️  无法解析 notBefore 日期: {date_str}")
                    pass
            elif 'notAfter' in line:
                date_str = line.split('=')[1].strip()
                try:
                    not_after = datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    logger.warning(f"⚠️  无法解析 notAfter 日期: {date_str}")
                    pass
        
        days_remaining = None
        is_valid = True
        if not_after:
            now = datetime.now(not_after.tzinfo) if not_after.tzinfo else datetime.now()
            delta = not_after - now
            days_remaining = delta.days
            is_valid = days_remaining >= 0
        
        # 去重 SANs，并确保主域名也在列表中
        all_domains = list(set(sans))
        if common_name and common_name not in all_domains:
            all_domains.insert(0, common_name)
        
        return {
            "not_before": not_before,
            "not_after": not_after,
            "is_valid": is_valid,
            "days_remaining": days_remaining,
            "issuer": issuer,
            "common_name": common_name,
            "subject": subject,
            "sans": sans,  # Subject Alternative Names
            "all_domains": all_domains,  # 所有域名（包括 CN 和 SANs）
        }
    except subprocess.TimeoutExpired:
        logger.error("❌ OpenSSL 命令超时")
        return {}
    except Exception as e:
        logger.error(f"❌ 从 PEM 提取证书信息失败: {e}", exc_info=True)
        return {}


def extract_cert_info_from_pem_sync(cert_pem: str) -> Dict:
    """
    从 PEM 格式证书中提取信息（同步版本）
    
    用于同步方法（create_certificate 和 update_certificate）
    """
    try:
        result = subprocess.run(
            ['openssl', 'x509', '-noout', '-text', '-dates', '-subject', '-issuer'],
            input=cert_pem,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error(f"❌ OpenSSL 命令失败: {result.stderr}")
            return {}
        
        output = result.stdout
        
        not_before = None
        not_after = None
        issuer = "Unknown"
        common_name = None
        subject = {}
        sans = []  # Subject Alternative Names
        
        # 提取 subject 信息（包含域名）
        subject_line = None
        for line in output.split('\n'):
            if 'subject=' in line or 'Subject:' in line:
                subject_line = line
                break
        
        if subject_line:
            # openssl 输出格式通常是：subject=C = US, CN = example.com
            # 提取 CN (Common Name) 字段作为域名
            cn_match = re.search(r'CN\s*=\s*([^,]+)', subject_line)
            if cn_match:
                common_name = cn_match.group(1).strip()
                subject["CN"] = common_name
        
        # 提取 SANs (Subject Alternative Names)
        # openssl 输出格式通常是：
        # X509v3 Subject Alternative Name:
        #     DNS:example.com, DNS:www.example.com, DNS:api.example.com
        in_san_section = False
        for line in output.split('\n'):
            if 'Subject Alternative Name' in line or 'X509v3 Subject Alternative Name' in line:
                in_san_section = True
                continue
            if in_san_section:
                # 提取 DNS: 开头的域名
                dns_matches = re.findall(r'DNS:\s*([^,\s]+)', line)
                sans.extend([dns.strip() for dns in dns_matches])
                # 如果遇到空行或下一个节，停止提取
                if line.strip() == '' or (line.strip() and not line.strip().startswith(' ') and ':' in line):
                    break
        
        # 提取 issuer 信息
        issuer_line = None
        for line in output.split('\n'):
            if 'issuer=' in line or 'Issuer:' in line:
                issuer_line = line
                break
        
        if issuer_line:
            org_match = re.search(r'O\s*=\s*([^,]+)', issuer_line)
            if org_match:
                issuer = org_match.group(1).strip()
            else:
                cn_match = re.search(r'CN\s*=\s*([^,]+)', issuer_line)
                if cn_match:
                    issuer = cn_match.group(1).strip()
        
        for line in output.split('\n'):
            if 'notBefore' in line:
                date_str = line.split('=')[1].strip()
                try:
                    not_before = datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    logger.warning(f"⚠️  无法解析 notBefore 日期: {date_str}")
                    pass
            elif 'notAfter' in line:
                date_str = line.split('=')[1].strip()
                try:
                    not_after = datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
                except ValueError:
                    logger.warning(f"⚠️  无法解析 notAfter 日期: {date_str}")
                    pass
        
        days_remaining = None
        is_valid = True
        if not_after:
            now = datetime.now(not_after.tzinfo) if not_after.tzinfo else datetime.now()
            delta = not_after - now
            days_remaining = delta.days
            is_valid = days_remaining >= 0
        
        # 去重 SANs，并确保主域名也在列表中
        all_domains = list(set(sans))
        if common_name and common_name not in all_domains:
            all_domains.insert(0, common_name)
        
        return {
            "not_before": not_before,
            "not_after": not_after,
            "is_valid": is_valid,
            "days_remaining": days_remaining,
            "issuer": issuer,
            "common_name": common_name,
            "subject": subject,
            "sans": sans,  # Subject Alternative Names
            "all_domains": all_domains,  # 所有域名（包括 CN 和 SANs）
        }
    except subprocess.TimeoutExpired:
        logger.error("❌ OpenSSL 命令超时")
        return {}
    except Exception as e:
        logger.error(f"❌ 从 PEM 提取证书信息失败: {e}", exc_info=True)
        return {}

