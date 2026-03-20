# coding=utf-8

"""
NFX-Vault API Server - HTTP API 服务

提供 FastAPI HTTP API 接口
"""
from modules.configs.local_env import load_repo_dotenv

load_repo_dotenv()

import os
import signal
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.configs import load_config, DatabaseConfig, CertConfig
from modules.server import init_connections, cleanup_connections
from modules.interfaces.http import register_routers
from modules.applications.acme import ACMEChallengeStorage
from modules.applications.file.handler.read_folders_and_store import read_folders_and_store_certificates
import uvicorn

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局连接对象
connections = None
cert_config: CertConfig = None
db_config: DatabaseConfig = None
acme_storage: ACMEChallengeStorage = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global connections, cert_config, db_config
    
    # 启动时执行
    logger.info("=" * 60)
    logger.info("  NFX-Vault API Server - HTTP API Service")
    logger.info("=" * 60)
    
    # 加载配置
    cert_config, db_config = load_config()
    
    # 初始化连接（MySQL, Redis, Kafka - 但不启动 Kafka Consumer）
    connections = init_connections(db_config=db_config, cert_config=cert_config)
    
    # 初始化 ACME 挑战存储（从配置读取）
    global acme_storage
    acme_storage = ACMEChallengeStorage(challenge_dir=cert_config.ACME_CHALLENGE_DIR)
    
    # 注册所有路由（统一入口）
    from modules.interfaces.http.handler.analysis.analysis import AnalysisHTTPHandler
    from modules.applications.analysis import AnalysisApplication
    
    analysis_application = AnalysisApplication()
    analysis_handler = AnalysisHTTPHandler(analysis_application=analysis_application)
    
    register_routers(
        app=app,
        tls_handler=connections.certificate_http_handler,
        file_handler=connections.file_http_handler,
        analysis_handler=analysis_handler,
        acme_storage=acme_storage
    )
    
    # 启动时读取文件夹并存储到数据库
    if cert_config.READ_ON_STARTUP:
        logger.info("📖 启动时读取文件夹并存储到数据库...")
        try:
            if connections.file_http_handler:
                # 从 handler 获取 file_application
                file_application = connections.file_http_handler.file_application
                
                # 在 lifespan 中直接使用 await（因为已经在异步上下文中）
                for store in ["websites", "apis"]:
                    result = await read_folders_and_store_certificates(
                        file_application,
                        store
                    )
                    logger.info(f"✅ 初始化完成: store={store}, processed={result.get('processed', 0)}")
        except Exception as e:
            logger.error(f"❌ 启动时读取文件夹失败: {e}", exc_info=True)
    
    yield
    
    # 清理连接（不清理 Kafka Consumer，因为它在 Pipeline 服务中）
    cleanup_connections(connections)
    logger.info("👋 API 服务器已停止")


# 创建 FastAPI 应用
app = FastAPI(
    title="NFX-Vault API",
    description="证书管理系统 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "NFX-Vault API",
        "version": "1.0.0",
        "description": "Certificate Management System - API Server"
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "api",
        "database": "connected" if connections and connections.db_session and connections.db_session.enable_mysql else "disconnected",
        "redis": "connected" if connections and connections.redis_client and connections.redis_client.enable_redis else "disconnected"
    }


# 路由注册在 lifespan 中完成（需要等待 connections 初始化）


def signal_handler(sig, frame):
    """信号处理器（优雅关闭）"""
    logger.info("\n🛑 收到停止信号，正在优雅关闭...")
    # FastAPI 会自动处理关闭逻辑


if __name__ == "__main__":
    # 注册信号处理器
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # 容器内生产默认 8000（compose 映射主机端口）；本地请用 scripts/dev-api.sh（默认 10151，与 Vite 代理一致）
    port = int(os.environ.get("NFX_VAULT_API_PORT", "8000"))
    dev = os.environ.get("NFX_VAULT_DEV", "").lower() in ("1", "true", "yes")
    host = os.environ.get("NFX_VAULT_API_HOST", "0.0.0.0")

    # 开发模式使用 import string 才能启用 uvicorn --reload
    if dev:
        uvicorn.run(
            "inputs.api.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="debug",
        )
    else:
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=False,
            log_level="info",
        )

