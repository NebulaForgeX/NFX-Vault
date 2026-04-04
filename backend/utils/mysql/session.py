import logging
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)


class MySQLSession:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 3306,
        database: str = "nfxvault",
        user: str = "root",
        password: str = "",
        enable_mysql: bool = True,
    ) -> None:
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
                url = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
                self.engine = create_engine(
                    url,
                    poolclass=QueuePool,
                    pool_pre_ping=True,
                    pool_recycle=3600,
                    pool_size=10,
                    max_overflow=20,
                    echo=False,
                )
                # 避免 commit 后 ORM 实例过期：仓库在 with 外仍读取 password_hash 等字段（登录否则会 500）
                self.SessionLocal = sessionmaker(
                    autocommit=False,
                    autoflush=False,
                    bind=self.engine,
                    expire_on_commit=False,
                )
                logger.info("MySQL 已连接 %s:%s/%s", self.host, self.port, self.database)
            except Exception as e:  # noqa: BLE001
                logger.error("MySQL 初始化失败: %s", e)
                self.enable_mysql = False
                self.engine = None
                self.SessionLocal = None

    def create_database(self) -> None:
        if not self.enable_mysql or not self.engine:
            return
        try:
            url_without_db = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}"
            temp_engine = create_engine(url_without_db, pool_pre_ping=True)
            with temp_engine.connect() as conn:
                conn.execute(
                    text(
                        f"CREATE DATABASE IF NOT EXISTS `{self.database}` "
                        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                    )
                )
                conn.commit()
            temp_engine.dispose()
        except Exception as e:  # noqa: BLE001
            logger.error("创建数据库失败: %s", e)

    def create_tables(self, base) -> None:
        if not self.enable_mysql or not self.engine:
            return
        try:
            self.create_database()
            base.metadata.create_all(bind=self.engine)
            logger.info("数据库表已就绪")
        except Exception as e:  # noqa: BLE001
            logger.error("创建表失败: %s", e)

    @contextmanager
    def get_session(self):
        if not self.enable_mysql or not self.SessionLocal:
            raise RuntimeError("MySQL 未启用")
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def close(self) -> None:
        if self.engine:
            self.engine.dispose()
            logger.info("MySQL 已关闭")
