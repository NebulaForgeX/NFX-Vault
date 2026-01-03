# NFX-Vault 部署指南

本文档提供在各种环境中部署 NFX-Vault 的详细说明。

## 📋 目录

- [前置要求](#前置要求)
- [生产环境部署](#生产环境部署)
- [开发环境部署](#开发环境部署)
- [Docker Compose 配置](#docker-compose-配置)
- [网络配置](#网络配置)
- [安全考虑](#安全考虑)
- [监控和日志](#监控和日志)
- [备份和恢复](#备份和恢复)
- [故障排除](#故障排除)

---

## 前置要求

### 系统要求

- **操作系统**：Linux（Ubuntu 20.04+、Debian 11+ 或 OpenWrt）
- **Docker**：20.10+
- **Docker Compose**：2.0+
- **内存**：最少 2GB，推荐 4GB+
- **磁盘**：最少 10GB 可用空间
- **网络**：端口 10199、10200 可用

### 必需服务

1. **MySQL** 8.0+
   - 用于存储证书元数据
   - 创建数据库：`nfxvault`

2. **Redis** 6.0+
   - 用于缓存
   - 默认端口：6379

3. **Kafka** 2.8+
   - 用于消息队列
   - 默认端口：9092

### 软件安装

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 jq（用于命令行工具）
sudo apt-get update
sudo apt-get install -y jq
```

---

## 生产环境部署

### 步骤 1：准备目录结构

```bash
# 创建主目录
sudo mkdir -p /volume1/Certs
cd /volume1/Certs

# 创建证书存储目录
sudo mkdir -p Websites/exported
sudo mkdir -p Apis/exported

# 创建证书文件并设置正确权限
sudo touch Websites/acme.json
sudo touch Apis/acme.json
sudo chmod 600 Websites/acme.json
sudo chmod 600 Apis/acme.json

# 创建文档目录
sudo mkdir -p docs
```

### 步骤 2：克隆或复制项目文件

```bash
# 选项 1：Git 克隆
git clone <repository-url> /volume1/Certs

# 选项 2：手动复制文件
# 将所有项目文件复制到 /volume1/Certs
```

### 步骤 3：配置环境变量

```bash
# 复制模板
cp .example.env .env

# 编辑配置
sudo nano .env
```

**关键生产设置：**

```bash
# 使用生产数据库凭据
MYSQL_ROOT_PASSWORD=strong_secure_password_here

# 使用生产 Redis 密码
REDIS_PASSWORD=strong_redis_password_here

# 配置正确的主机地址
BACKEND_HOST=your-server-ip
FRONTEND_HOST=your-server-ip

# 启用调度
SCHEDULE_ENABLED=true
READ_ON_STARTUP=true
```

### 步骤 4：创建 Docker 网络

```bash
# 创建内部网络
docker network create nfx-vault

# 创建外部网络（如果使用 Traefik）
docker network create nfx-edge
```

### 步骤 5：初始化数据库

```bash
# 连接到 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE nfxvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选，提高安全性）
CREATE USER 'nfxvault'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON nfxvault.* TO 'nfxvault'@'%';
FLUSH PRIVILEGES;
```

### 步骤 6：启动服务

```bash
cd /volume1/Certs

# 构建并启动所有服务
docker compose up -d

# 检查状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 步骤 7：验证部署

```bash
# 检查 API 健康状态
curl http://your-server-ip:10200/health

# 检查前端
curl http://your-server-ip:10199

# 检查 API 文档
curl http://your-server-ip:10200/docs
```

---

## 开发环境部署

### 开发快速开始

```bash
# 克隆项目
git clone <repository-url> /volume1/Certs
cd /volume1/Certs

# 复制环境文件
cp .example.env .env

# 使用开发设置编辑 .env
nano .env

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 开发环境变量

```bash
# 使用开发数据库
MYSQL_HOST=localhost
MYSQL_ROOT_PASSWORD=dev_password

# 使用开发 Redis
REDIS_HOST=localhost
REDIS_PASSWORD=

# 启用热重载（如果正在开发）
# 前端：在 server/frontend 中运行 npm run dev
# 后端：uvicorn main:app --reload
```

---

## Docker Compose 配置

### 服务配置

`docker-compose.yml` 定义三个主要服务：

1. **backend-api**：HTTP API 服务
   - 端口：10200
   - 依赖：MySQL、Redis、Kafka

2. **backend-pipeline**：Kafka 消费者服务
   - 无外部端口
   - 处理异步事件

3. **frontend**：Web 界面
   - 端口：10199
   - Nginx 提供 React 应用

### 卷挂载

```yaml
volumes:
  - /volume1/Certs:/volume1/Certs:rw          # 证书存储
  - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker 套接字
  - /tmp/acme-challenges:/tmp/acme-challenges:rw  # ACME 挑战
```

### 网络配置

```yaml
networks:
  nfx-vault:    # 内部网络
  nfx-edge:     # 外部网络（用于 Traefik）
```

---

## 网络配置

### 防火墙规则

```bash
# 允许前端端口
sudo ufw allow 10199/tcp

# 允许后端 API 端口
sudo ufw allow 10200/tcp

# 允许 MySQL（如果远程）
sudo ufw allow 3306/tcp

# 允许 Redis（如果远程）
sudo ufw allow 6379/tcp

# 允许 Kafka（如果远程）
sudo ufw allow 9092/tcp
```

### 反向代理（Nginx）

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name vault.example.com;

    location / {
        proxy_pass http://localhost:10199;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api-vault.example.com;

    location / {
        proxy_pass http://localhost:10200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 安全考虑

### 1. 环境变量

- 永远不要将 `.env` 文件提交到版本控制
- 生产环境使用强密码
- 定期轮换凭据
- 使用密钥管理（Docker secrets、Vault 等）

### 2. 文件权限

```bash
# 证书文件应为 600
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# 目录权限
chmod 700 Websites
chmod 700 Apis
```

### 3. 网络安全

- 使用内部 Docker 网络
- 限制外部访问
- 使用防火墙规则
- 启用 HTTPS（通过反向代理）

### 4. 容器安全

- 以非 root 用户运行容器
- 尽可能使用只读文件系统
- 保持镜像更新
- 扫描漏洞

---

## 监控和日志

### 日志管理

```bash
# 查看所有日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend-api
docker compose logs -f backend-pipeline
docker compose logs -f frontend

# 导出日志
docker compose logs > nfx-vault.log
```

### 健康检查

```bash
# API 健康检查
curl http://localhost:10200/health

# 容器状态
docker compose ps

# 资源使用
docker stats
```

### 监控工具

考虑集成：
- **Prometheus** - 指标收集
- **Grafana** - 可视化
- **ELK Stack** - 日志聚合
- **Sentry** - 错误跟踪

---

## 备份和恢复

### 备份策略

1. **证书文件**
   ```bash
   # 备份证书目录
   tar -czf certs-backup-$(date +%Y%m%d).tar.gz Websites/ Apis/
   ```

2. **数据库**
   ```bash
   # 备份 MySQL 数据库
   mysqldump -u root -p nfxvault > nfxvault-backup-$(date +%Y%m%d).sql
   ```

3. **配置**
   ```bash
   # 备份配置
   cp .env .env.backup
   cp docker-compose.yml docker-compose.yml.backup
   ```

### 恢复程序

1. **恢复证书**
   ```bash
   tar -xzf certs-backup-YYYYMMDD.tar.gz
   ```

2. **恢复数据库**
   ```bash
   mysql -u root -p nfxvault < nfxvault-backup-YYYYMMDD.sql
   ```

3. **重启服务**
   ```bash
   docker compose down
   docker compose up -d
   ```

---

## 故障排除

### 常见问题

#### 1. 容器无法启动

```bash
# 检查日志
docker compose logs

# 检查端口冲突
netstat -tuln | grep 10199
netstat -tuln | grep 10200

# 检查磁盘空间
df -h

# 检查 Docker 守护进程
docker info
```

#### 2. 数据库连接错误

```bash
# 测试 MySQL 连接
mysql -h $MYSQL_HOST -u $MYSQL_ROOT_USERNAME -p

# 检查 MySQL 是否运行
systemctl status mysql

# 检查网络连接
ping $MYSQL_HOST
```

#### 3. 证书读取错误

```bash
# 检查权限
ls -la /volume1/Certs/Websites

# 检查 Docker 卷挂载
docker compose exec backend-api ls -la /volume1/Certs

# 检查 SELinux（如果适用）
getenforce
```

#### 4. 前端无法加载

```bash
# 检查前端容器
docker compose logs frontend

# 检查 nginx 配置
docker compose exec frontend cat /etc/nginx/nginx.conf

# 从前端测试 API 连接
docker compose exec frontend curl http://backend-api:8000/health
```

### 调试模式

启用调试日志：

```bash
# 在 .env 文件中
PYTHONUNBUFFERED=1
LOG_LEVEL=DEBUG
```

---

## 性能调优

### 资源限制

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

### 数据库优化

- 启用查询缓存
- 添加适当的索引
- 定期维护

### Redis 优化

- 配置内存限制
- 根据需要启用持久化
- 调整缓存 TTL

---

## 更新和维护

### 更新服务

```bash
# 拉取最新代码
git pull

# 重建并重启
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 数据库迁移

```bash
# 运行迁移（如果适用）
docker compose exec backend-api python manage.py migrate
```

---

## 后续步骤

部署后：

1. 配置反向代理（如果需要）
2. 设置 SSL 证书
3. 配置监控
4. 设置备份
5. 审查安全设置
6. 测试所有功能

更多信息，请参阅：
- [配置指南](CONFIGURATION.md) [English](en/CONFIGURATION.md)
- [开发指南](DEVELOPMENT.md) [English](en/DEVELOPMENT.md)
- [API 文档](API.md) [English](en/API.md)

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**相关文档**：
- [English Version](en/DEPLOYMENT.md)
- [配置指南](CONFIGURATION.md)
- [开发指南](DEVELOPMENT.md)
