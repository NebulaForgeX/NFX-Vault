import logging
from contextlib import contextmanager
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)


class PostgresSession:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 5432,
        database: str = "nfxvault",
        user: str = "postgres",
        password: str = "",
        enable_db: bool = True,
    ) -> None:
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.enable_db = enable_db
        self.engine = None
        self.SessionLocal = None

        if self.enable_db:
            try:
                pwd = quote_plus(self.password)
                url = (
                    f"postgresql+psycopg2://{self.user}:{pwd}"
                    f"@{self.host}:{self.port}/{self.database}"
                )
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
                logger.info("PostgreSQL 已连接 %s:%s/%s", self.host, self.port, self.database)
            except Exception as e:  # noqa: BLE001
                logger.error("PostgreSQL 初始化失败: %s", e)
                self.enable_db = False
                self.engine = None
                self.SessionLocal = None

    def create_database(self) -> None:
        if not self.enable_db or not self.engine:
            return
        try:
            pwd = quote_plus(self.password)
            url_without_db = (
                f"postgresql+psycopg2://{self.user}:{pwd}@{self.host}:{self.port}/postgres"
            )
            temp_engine = create_engine(url_without_db, isolation_level="AUTOCOMMIT")
            with temp_engine.connect() as conn:
                exists = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :name"),
                    {"name": self.database},
                ).scalar()
                if not exists:
                    conn.execute(text(f'CREATE DATABASE "{self.database}" ENCODING \'UTF8\''))
            temp_engine.dispose()
        except Exception as e:  # noqa: BLE001
            logger.error("创建数据库失败: %s", e)

    def create_tables(self, base) -> None:
        if not self.enable_db or not self.engine:
            return
        try:
            self.create_database()
            base.metadata.create_all(bind=self.engine)
            logger.info("数据库表已就绪")
        except Exception as e:  # noqa: BLE001
            logger.error("创建表失败: %s", e)

    @contextmanager
    def get_session(self):
        if not self.enable_db or not self.SessionLocal:
            raise RuntimeError("PostgreSQL 未启用")
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
            logger.info("PostgreSQL 已关闭")
