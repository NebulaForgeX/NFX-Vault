# coding=utf-8

"""
MySQL 数据库会话管理

使用 SQLAlchemy ORM 进行数据库操作
"""
import logging
from typing import Optional
from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)


class MySQLSession:
    """MySQL 数据库会话管理类"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 3306,
        database: str = "nfxvault",
        user: str = "root",
        password: str = "",
        enable_mysql: bool = True
    ):
        """
        初始化 MySQL 会话
        
        Args:
            host: MySQL 主机地址
            port: MySQL 端口
            database: 数据库名称
            user: 用户名
            password: 密码
            enable_mysql: 是否启用 MySQL
        """
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.enable_mysql = enable_mysql
        self.engine = None
        self.SessionLocal = None
        
        if self.enable_mysql:
            try:
                # 构建连接 URL
                url = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
                
                # 创建引擎
                self.engine = create_engine(
                    url,
                    poolclass=QueuePool,
                    pool_pre_ping=True,  # 自动重连
                    pool_recycle=3600,  # 1小时回收连接
                    pool_size=10,
                    max_overflow=20,
                    echo=False
                )
                
                # 创建会话工厂
                self.SessionLocal = sessionmaker(
                    autocommit=False,
                    autoflush=False,
                    bind=self.engine
                )
                
                logger.info(f"✅ MySQL 连接已初始化: {self.host}:{self.port}/{self.database}")
            except Exception as e:
                logger.error(f"❌ MySQL 连接初始化失败: {e}")
                self.enable_mysql = False
                self.engine = None
                self.SessionLocal = None
    
    def create_database(self):
        """创建数据库（如果不存在）"""
        if not self.enable_mysql or not self.engine:
            return
        
        try:
            # 连接到 MySQL（不指定数据库）
            url_without_db = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}"
            temp_engine = create_engine(url_without_db, pool_pre_ping=True)
            
            with temp_engine.connect() as conn:
                # 创建数据库（如果不存在）
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{self.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                conn.commit()
            
            temp_engine.dispose()
            logger.info(f"✅ 数据库已创建或已存在: {self.database}")
        except Exception as e:
            logger.error(f"❌ 创建数据库失败: {e}")
    
    def create_tables(self, base):
        """创建数据库表（如果不存在）"""
        if not self.enable_mysql or not self.engine:
            return
        
        try:
            # 先创建数据库
            self.create_database()
            
            # 创建所有表（使用传入的 base）
            base.metadata.create_all(bind=self.engine)
            logger.info("✅ 数据库表已创建或已存在")
        except Exception as e:
            logger.error(f"❌ 创建数据库表失败: {e}")
    
    @contextmanager
    def get_session(self):
        """获取数据库会话（上下文管理器）"""
        if not self.enable_mysql or not self.SessionLocal:
            raise RuntimeError("MySQL 未启用或未初始化")
        
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def close(self):
        """关闭数据库连接"""
        if self.engine:
            self.engine.dispose()
            logger.info("✅ MySQL 连接已关闭")

