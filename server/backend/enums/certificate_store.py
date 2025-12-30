# coding=utf-8

"""
证书存储位置枚举

定义证书的存储位置类型
"""
from enum import Enum
from typing import Optional


class CertificateStore(str, Enum):
    """证书存储位置枚举"""
    
    WEBSITES = "websites"  # 网站证书
    APIS = "apis"          # API 证书
    DATABASE = "database"  # 数据库存储（申请的证书）
    
    def __str__(self) -> str:
        return self.value
    
    @classmethod
    def validate(cls, value: Optional[str]) -> Optional[str]:
        """
        验证 store 值是否有效
        
        Args:
            value: 待验证的 store 值
            
        Returns:
            验证通过返回原值，否则抛出 ValueError
            
        Raises:
            ValueError: 如果值不在允许的范围内
        """
        if value is None:
            return None
        
        valid_values = [cls.WEBSITES.value, cls.APIS.value, cls.DATABASE.value]
        if value not in valid_values:
            raise ValueError(f"store must be one of {valid_values}, got '{value}'")
        
        return value

