# coding=utf-8

"""
NFX-Vault Pipeline Server - Kafka Consumer 服务

监听 Kafka 事件并处理（operation.refresh）
"""
from modules.configs.local_env import load_repo_dotenv

load_repo_dotenv()

import os
import signal
import logging
import time

# 在 Docker 中，工作目录是 backend 根目录，所以可以直接导入
from modules.configs import load_config, DatabaseConfig, CertConfig
from modules.server import init_connections, cleanup_connections
from tasks import setup_scheduler, shutdown_scheduler

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局运行状态
running = True


def signal_handler(sig, frame):
    """信号处理器（优雅关闭）"""
    global running
    logger.info("\n🛑 收到停止信号，正在优雅关闭...")
    running = False


def run_pipeline_server():
    """Pipeline 服务器模式：持续运行，监听 Kafka 事件"""
    global running
    
    # 注册信号处理器
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # 加载配置
    cert_config, db_config = load_config()
    
    logger.info("=" * 60)
    logger.info("  NFX-Vault Pipeline Server - Kafka Consumer Service")
    logger.info("=" * 60)
    logger.info("🚀 启动 Pipeline 服务器模式（Kafka 事件监听）")
    
    # 初始化连接（MySQL, Redis, Kafka）和 Controllers
    connections = init_connections(db_config=db_config, cert_config=cert_config)
    
    # 启动 Kafka 监听线程（controller 已经通过 event_router 注册到 kafka_consumer）
    kafka_consumer_thread = None
    if connections.kafka_consumer:
        from resources.kafka import KafkaConsumerThread
        if connections.kafka_consumer.start():
            kafka_consumer_thread = KafkaConsumerThread(connections.kafka_consumer)
            kafka_consumer_thread.start()
            logger.info("✅ Kafka Consumer 监听线程已启动（controller 已注册）")
        else:
            logger.error("❌ Kafka Consumer 启动失败")
    
    # 启动定时任务调度器（读取文件夹、更新剩余天数等）
    scheduler = setup_scheduler(cert_config, connections)
    
    # 主循环：持续运行（Kafka 监听在后台线程运行）
    logger.info("🔄 Pipeline 服务器正在运行，等待 Kafka 事件...")
    
    try:
        while running:
            # 检查 Kafka Consumer 线程是否还在运行
            if kafka_consumer_thread and not kafka_consumer_thread.is_alive():
                logger.error("❌ Kafka Consumer 线程意外退出")
                break
            
            # 每秒检查一次
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 收到键盘中断信号")
    except Exception as e:
        logger.error(f"❌ 主循环出错: {e}", exc_info=True)
    
    # 停止定时任务调度器
    shutdown_scheduler(scheduler)
    
    # 停止 Kafka Consumer 线程
    if kafka_consumer_thread and connections.kafka_consumer:
        logger.info("🛑 正在停止 Kafka Consumer 线程...")
        connections.kafka_consumer.stop()
        kafka_consumer_thread.join(timeout=5)
        if kafka_consumer_thread.is_alive():
            logger.warning("⚠️  Kafka Consumer 线程未在 5 秒内停止")
        else:
            logger.info("✅ Kafka Consumer 线程已停止")
    
    # 清理连接
    cleanup_connections(connections)
    logger.info("👋 Pipeline 服务器已停止")


def main():
    """主函数"""
    logger.info("🚀 启动 Pipeline Server（Kafka Consumer 模式）")
    logger.info("📌 注意：此模式依赖 Kafka，请确保已正确配置")
    
    try:
        run_pipeline_server()
    except FileNotFoundError as e:
        logger.error(f"❌ 配置文件错误: {e}")
    except Exception as e:
        logger.error(f"❌ 程序运行错误: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

