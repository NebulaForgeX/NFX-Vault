# NFX-Vault 配置指南

本文档详细说明 NFX-Vault 中的所有配置选项。

## 📋 目录

- [环境变量](#环境变量)
- [Docker Compose 配置](#docker-compose-配置)
- [后端配置](#后端配置)
- [前端配置](#前端配置)
- [数据库配置](#数据库配置)
- [安全配置](#安全配置)
- [性能调优](#性能调优)

---

## 环境变量

所有配置通过 `.env` 文件完成。复制 `.example.env` 到 `.env` 并根据需要修改。

### 服务端口

```bash
# 后端 API 服务主机和端口
BACKEND_HOST=192.168.1.64          # 主机 IP 地址
BACKEND_PORT=10200                 # 后端 API 端口

# 前端服务主机和端口
FRONTEND_HOST=192.168.1.64         # 主机 IP 地址
FRONTEND_PORT=10199                # 前端 Web 端口
```

**注意事项：**
- 使用 `0.0.0.0` 绑定到所有接口
- 使用特定 IP 以提高安全性
- 确保端口未被其他服务占用

---

### MySQL 数据库配置

```bash
# MySQL 服务器主机
MYSQL_HOST=192.168.1.64            # MySQL 服务器 IP 或主机名

# MySQL 端口
MYSQL_DATABASE_PORT=3306            # 默认 MySQL 端口

# 数据库名称
MYSQL_DATABASE=nfxvault            # 数据库名称

# 数据库凭据
MYSQL_ROOT_USERNAME=root            # MySQL 用户名
MYSQL_ROOT_PASSWORD=your_password   # MySQL 密码
```

**安全建议：**
- 使用强密码
- 创建专用数据库用户（非 root）
- 限制网络访问
- 为远程访问启用 SSL 连接

**连接字符串格式：**
```
mysql+pymysql://{username}:{password}@{host}:{port}/{database}
```

---

### Redis 缓存配置

```bash
# Redis 服务器主机
REDIS_HOST=192.168.1.64             # Redis 服务器 IP 或主机名

# Redis 端口
REDIS_DATABASE_PORT=6379            # 默认 Redis 端口

# Redis 数据库编号
REDIS_DB=0                          # 数据库编号（0-15）

# Redis 密码
REDIS_PASSWORD=your_redis_password  # 无密码时留空

# 缓存 TTL（生存时间），单位：秒
REDIS_CACHE_TTL=3600                # 默认 1 小时
```

**注意事项：**
- 不同环境使用不同的 `REDIS_DB` 编号
- 根据需求设置 `REDIS_CACHE_TTL`
- 更长的 TTL = 更少的数据库查询，但可能数据过时

---

### Kafka 消息队列配置

```bash
# Kafka bootstrap 服务器
KAFKA_BOOTSTRAP_SERVERS=192.168.1.64:9092  # 逗号分隔列表

# Kafka 主题
KAFKA_EVENT_TOPIC=nfxvault.cert_server              # 主事件主题
KAFKA_EVENT_POISON_TOPIC=nfxvault.cert_server.poison # 死信主题

# 消费者组 ID
KAFKA_CONSUMER_GROUP_ID=nfxvault-cert-server        # 消费者组
```

**注意事项：**
- 多个代理：`broker1:9092,broker2:9092`
- 如果启用了自动创建，主题会自动创建
- 死信主题存储失败的消息用于调试

---

### 证书管理配置

```bash
# 证书存储根目录
CERTS_DIR=/volume1/Certs            # 证书的绝对路径

# ACME 挑战目录
ACME_CHALLENGE_DIR=/tmp/acme-challenges  # ACME 挑战目录

# 证书操作最大等待时间（秒）
CERT_MAX_WAIT_TIME=360              # 默认 6 分钟
```

**目录结构：**
```
CERTS_DIR/
├── Websites/
│   ├── acme.json
│   └── exported/
└── Apis/
    ├── acme.json
    └── exported/
```

**权限：**
```bash
# 证书文件应为 600
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# 目录应为 700
chmod 700 Websites
chmod 700 Apis
```

---

### 调度配置

```bash
# 启动时读取证书
READ_ON_STARTUP=true                # true/false

# 启用定时任务
SCHEDULE_ENABLED=true              # true/false

# 每周调度 - 星期几
SCHEDULE_WEEKLY_DAY=mon             # mon, tue, wed, thu, fri, sat, sun

# 每周调度 - 小时
SCHEDULE_WEEKLY_HOUR=2               # 0-23（24 小时制）

# 每周调度 - 分钟
SCHEDULE_WEEKLY_MINUTE=0             # 0-59
```

**调度示例：**
```bash
# 每周一凌晨 2:00
SCHEDULE_WEEKLY_DAY=mon
SCHEDULE_WEEKLY_HOUR=2
SCHEDULE_WEEKLY_MINUTE=0

# 每周日午夜
SCHEDULE_WEEKLY_DAY=sun
SCHEDULE_WEEKLY_HOUR=0
SCHEDULE_WEEKLY_MINUTE=0
```

**注意：** 证书状态更新任务每天凌晨 1:00 执行（不可配置）。

---

## Docker Compose 配置

### 服务配置

`docker-compose.yml` 文件定义服务配置：

```yaml
services:
  backend-api:
    build:
      context: ./server/backend
      dockerfile: inputs/api/Dockerfile
    container_name: NFX-Vault-Backend-API
    restart: always
    ports:
      - "${BACKEND_HOST}:${BACKEND_PORT}:8000"
    volumes:
      - /volume1/Certs:/volume1/Certs:rw
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /tmp/acme-challenges:/tmp/acme-challenges:rw
    environment:
      - PYTHONUNBUFFERED=1
      # ... 其他环境变量
    networks:
      - nfx-vault
      - nfx-edge
```

### 卷挂载

- `/volume1/Certs:/volume1/Certs:rw` - 证书存储（读写）
- `/var/run/docker.sock:/var/run/docker.sock:ro` - Docker 套接字（只读）
- `/tmp/acme-challenges:/tmp/acme-challenges:rw` - ACME 挑战（读写）

### 网络

- `nfx-vault`：用于服务通信的内部桥接网络
- `nfx-edge`：用于与 Traefik 集成的外部网络（必须存在）

---

## 后端配置

### 应用设置

后端配置从环境变量加载，可通过以下方式访问：

```python
from modules.configs import load_config, DatabaseConfig, CertConfig

# 加载配置
cert_config, db_config = load_config()

# 访问配置
db_host = db_config.MYSQL_HOST
cert_dir = cert_config.BASE_DIR
```

### 日志配置

```python
# 日志级别：DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=DEBUG  # 在 .env 中设置

# Python 无缓冲输出
PYTHONUNBUFFERED=1  # Docker 推荐
```

### 数据库连接池

在 SQLAlchemy 中配置：

```python
# 连接池设置（在代码中）
pool_size=10
max_overflow=20
pool_timeout=30
```

---

## 前端配置

### API 基础 URL

在 `src/apis/config.ts` 中配置：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10200';
```

通过环境变量设置：
```bash
VITE_API_BASE_URL=http://192.168.1.64:10200
```

### 构建配置

`vite.config.ts`：

```typescript
export default defineConfig({
  server: {
    port: 5173,  // 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:10200',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 数据库配置

### MySQL 设置

推荐的 MySQL 配置（`my.cnf`）：

```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_type = 1
query_cache_size = 64M
```

### 数据库架构

主数据库表在首次运行时自动创建：

- `tls_certificates` - TLS 证书元数据
  - 存储所有证书信息，包括域名、颁发者、有效期、证书内容、私钥
  - 按 store、domain、source 和 folder_name 建立索引
  - (domain, source, store) 上的唯一约束

---

## 安全配置

### 文件权限

```bash
# 证书文件
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# 目录
chmod 700 Websites
chmod 700 Apis

# 配置文件
chmod 600 .env
```

### 网络安全

1. **防火墙规则：**
   ```bash
   # 仅允许特定 IP
   ufw allow from 192.168.1.0/24 to any port 10200
   ```

2. **Docker 网络：**
   - 使用内部网络进行服务通信
   - 限制外部网络访问

3. **反向代理：**
   - 使用带 SSL 的 Nginx/Traefik
   - 启用速率限制
   - 正确配置 CORS

### 环境变量安全

- 永远不要将 `.env` 提交到版本控制
- 生产环境使用密钥管理
- 定期轮换凭据
- 使用强密码

---

## 性能调优

### 数据库优化

```bash
# 连接池大小
# 高流量时增加
MYSQL_POOL_SIZE=20

# 查询超时
MYSQL_QUERY_TIMEOUT=30
```

### Redis 优化

```bash
# 缓存 TTL
REDIS_CACHE_TTL=3600  # 根据更新频率调整

# 连接池
REDIS_MAX_CONNECTIONS=50
```

### 容器资源

添加到 `docker-compose.yml`：

```yaml
services:
  backend-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## 配置验证

### 检查配置

```bash
# 验证环境变量
docker compose config

# 测试数据库连接
docker compose exec backend-api python -c "from modules.configs import load_config; cert_config, db_config = load_config(); print(db_config.MYSQL_HOST)"

# 测试 Redis 连接
docker compose exec backend-api python -c "import redis; r = redis.Redis(host='$REDIS_HOST'); r.ping()"
```

### 常见配置问题

1. **端口冲突：**
   ```bash
   # 检查端口是否被占用
   netstat -tuln | grep 10199
   netstat -tuln | grep 10200
   ```

2. **权限问题：**
   ```bash
   # 检查文件权限
   ls -la /volume1/Certs/Websites
   ```

3. **网络问题：**
   ```bash
   # 测试连接
   ping $MYSQL_HOST
   telnet $REDIS_HOST $REDIS_DATABASE_PORT
   ```

---

## 配置示例

### 开发环境

```bash
BACKEND_HOST=localhost
BACKEND_PORT=10200
FRONTEND_HOST=localhost
FRONTEND_PORT=10199

MYSQL_HOST=localhost
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE=nfxvault_dev
MYSQL_ROOT_USERNAME=root
MYSQL_ROOT_PASSWORD=dev_password

REDIS_HOST=localhost
REDIS_DATABASE_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

SCHEDULE_ENABLED=false
READ_ON_STARTUP=true
```

### 生产环境

```bash
BACKEND_HOST=192.168.1.64
BACKEND_PORT=10200
FRONTEND_HOST=192.168.1.64
FRONTEND_PORT=10199

MYSQL_HOST=192.168.1.64
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE=nfxvault
MYSQL_ROOT_USERNAME=nfxvault_user
MYSQL_ROOT_PASSWORD=strong_production_password

REDIS_HOST=192.168.1.64
REDIS_DATABASE_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=strong_redis_password

SCHEDULE_ENABLED=true
READ_ON_STARTUP=true
SCHEDULE_WEEKLY_DAY=mon
SCHEDULE_WEEKLY_HOUR=2
SCHEDULE_WEEKLY_MINUTE=0
```

---

## 其他资源

- [部署指南](DEPLOYMENT.md) [English](en/DEPLOYMENT.md)
- [开发指南](DEVELOPMENT.md) [English](en/DEVELOPMENT.md)
- [API 文档](API.md) [English](en/API.md)
- [项目结构](STRUCTURE.md) [English](en/STRUCTURE.md)

如有具体配置问题，请参考源代码或联系开发团队。

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**相关文档**：
- [English Version](en/CONFIGURATION.md)
- [部署指南](DEPLOYMENT.md)
- [开发指南](DEVELOPMENT.md)
