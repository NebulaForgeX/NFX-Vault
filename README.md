# NFX-Vault - SSL 证书管理系统

> ⚠️ **重要提示**：使用本仓库前，请先阅读 [NFX-Policy](https://github.com/NebulaForgeX/NFX-Policy)，了解部署和配置的重要注意事项。

<div align="center">
  <img src="image.png" alt="NFX-Vault Logo" width="200">
  
  **基于 Web 的 SSL 证书管理和监控系统**
  
  [English Documentation](docs/en/README.md) | [项目结构](docs/STRUCTURE.md) | [API 文档](docs/API.md)
</div>

---

## 📖 项目简介

NFX-Vault 是一个现代化的 SSL 证书管理和监控系统，提供统一的证书检查、导出和管理功能。系统采用前后端分离架构，支持 Web 界面和命令行工具两种使用方式，帮助您轻松管理多个域名的 SSL 证书。

### ✨ 核心特性

- 🔒 **统一证书管理** - 集中管理 Websites 和 APIs 的 SSL 证书
- 📊 **实时监控** - 查看证书状态、过期时间和剩余天数
- 📥 **一键导出** - 快速导出证书文件到指定目录
- 🌐 **现代化 Web 界面** - 基于 React + TypeScript 的响应式界面
- 🚀 **RESTful API** - 基于 FastAPI 的高性能后端服务
- 🐳 **Docker 部署** - 使用 Docker Compose 一键部署
- 📝 **命令行工具** - 提供交互式命令行工具作为备选方案
- ⏰ **自动调度** - 支持定时任务自动检查证书状态

---

## 🚀 快速开始

### 前置要求

在开始之前，请确保您的系统已安装以下软件：

1. **Docker** 和 **Docker Compose**
   ```bash
   # 检查 Docker 版本
   docker --version
   docker compose version
   ```

2. **jq**（用于 JSON 解析，命令行工具需要）
   ```bash
   # 在 OpenWrt 系统上
   opkg install jq
   
   # 在 Ubuntu/Debian 系统上
   sudo apt-get install jq
   ```

3. **MySQL** 数据库（用于存储证书元数据）
4. **Redis** 缓存服务（用于提升性能）
5. **Kafka** 消息队列（用于异步任务处理）

### 安装步骤

#### 1. 克隆或下载项目

```bash
cd /volume1
git clone <repository-url> Certs
# 或直接下载并解压到 /home/kali/repo
```

#### 2. 创建证书存储目录

```bash
cd /home/kali/repo

# 创建 Websites 证书目录
mkdir -p Websites/exported
touch Websites/acme.json
chmod 600 Websites/acme.json

# 创建 Apis 证书目录
mkdir -p Apis/exported
touch Apis/acme.json
chmod 600 Apis/acme.json
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .example.env .env

# 编辑配置文件
vim .env
# 或使用您喜欢的编辑器
nano .env
```

**重要配置项说明：**

```bash
# Docker 服务端口（根据实际情况修改）
BACKEND_HOST=192.168.1.64
BACKEND_PORT=10151
FRONTEND_HOST=192.168.1.64
FRONTEND_PORT=10152

# MySQL 数据库配置
MYSQL_HOST=192.168.1.64
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE=nfxvault
MYSQL_ROOT_USERNAME=root
MYSQL_ROOT_PASSWORD=your_mysql_password

# Redis 缓存配置
REDIS_HOST=192.168.1.64
REDIS_DATABASE_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# Kafka 消息队列配置
KAFKA_BOOTSTRAP_SERVERS=192.168.1.64:9092
KAFKA_EVENT_TOPIC=nfxvault.cert_server
KAFKA_EVENT_POISON_TOPIC=nfxvault.cert_server.poison
KAFKA_CONSUMER_GROUP_ID=nfxvault-cert-server

# 证书存储目录
CERTS_DIR=/home/kali/repo
ACME_CHALLENGE_DIR=/tmp/acme-challenges

# 调度配置
READ_ON_STARTUP=true          # 启动时读取证书
SCHEDULE_ENABLED=true         # 启用定时任务
SCHEDULE_WEEKLY_DAY=mon       # 每周一执行
SCHEDULE_WEEKLY_HOUR=2        # 凌晨 2 点
SCHEDULE_WEEKLY_MINUTE=0      # 0 分
```

#### 4. 启动服务

```bash
cd /home/kali/repo
docker compose up -d
```

#### 5. 验证安装

检查容器状态：
```bash
docker compose ps
```

查看日志：
```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend-api
docker compose logs -f frontend
```

#### 6. 访问服务

- **前端 Web 界面**：http://192.168.1.64:10152
- **后端 API**：http://192.168.1.64:10151
- **API 文档（Swagger）**：http://192.168.1.64:10151/docs
- **API 文档（ReDoc）**：http://192.168.1.64:10151/redoc

---

## 📁 目录结构

```
Certs/
├── server/                    # 服务端代码
│   ├── backend/              # 后端服务（Python FastAPI）
│   └── frontend/             # 前端应用（React + TypeScript）
├── Websites/                 # 网站证书存储目录
│   ├── acme.json            # Traefik 证书存储文件
│   └── exported/            # 导出的证书文件
├── Apis/                     # API 证书存储目录
│   ├── acme.json            # Traefik 证书存储文件
│   └── exported/            # 导出的证书文件
├── docs/                     # 项目文档（英文）
├── cmd.sh                    # 命令行工具
├── docker-compose.yml        # Docker Compose 配置
├── .example.env              # 环境变量模板
└── README.md                 # 本文档
```

详细的项目结构说明请参考 [STRUCTURE.md](docs/STRUCTURE.md)。

---

## 🛠️ 使用指南

### Web 界面使用

1. 打开浏览器访问前端地址：`http://your-ip:10152`
2. 在界面中查看所有证书的状态
3. 点击证书可以查看详细信息
4. 使用导出功能将证书导出到指定目录

### 命令行工具使用

如果不想使用 Web 界面，可以使用命令行工具：

```bash
cd /home/kali/repo
./cmd.sh
```

**命令行工具功能：**
- 选择证书类型（websites 或 apis）
- 自动扫描并列出所有子文件夹
- 选择子文件夹进行验证
- 验证证书详细信息：
  - 证书和私钥文件存在性
  - 证书主题、颁发者、有效期
  - 域名信息（SANs）
  - 私钥格式验证
  - 证书和私钥匹配验证
  - 证书剩余天数（带颜色警告）

### API 使用

详细的 API 文档请参考 [API.md](docs/API.md)。

**快速示例：**

```bash
# 检查 Websites 证书（带分页）
curl "http://192.168.1.64:10151/vault/tls/check/websites?offset=0&limit=20"

# 导出 Websites 证书
curl -X POST http://192.168.1.64:10151/vault/file/export/websites

# 刷新证书（触发重新读取）
curl -X POST http://192.168.1.64:10151/vault/tls/refresh/websites
```

---

## ⚙️ 配置说明

### 环境变量

所有配置项都在 `.env` 文件中，主要分为以下几类：

1. **服务端口配置** - 前端和后端的访问端口
2. **数据库配置** - MySQL 连接信息
3. **缓存配置** - Redis 连接信息
4. **消息队列配置** - Kafka 连接信息
5. **证书管理配置** - 证书存储路径和 ACME 挑战目录
6. **调度配置** - 定时任务的执行时间

详细的配置说明请参考 [CONFIGURATION.md](docs/CONFIGURATION.md)。

### Docker 网络

项目使用独立的 Docker 网络：
- `nfx-vault`：内部服务通信网络（bridge 模式）
- `nfx-edge`：外部网络（需要预先创建，用于与 Traefik 等反向代理通信）

---

## 🔧 常见问题

### 1. 容器启动失败

**问题**：容器无法启动或立即退出

**解决方案**：
- 检查 `.env` 文件配置是否正确
- 检查端口是否被占用：`netstat -tuln | grep 10152`
- 查看容器日志：`docker compose logs backend-api`
- 确保 MySQL、Redis、Kafka 服务正常运行

### 2. 无法访问 Web 界面

**问题**：浏览器无法打开前端页面

**解决方案**：
- 检查防火墙设置
- 确认端口映射正确：`docker compose ps`
- 检查前端容器日志：`docker compose logs frontend`

### 3. 证书读取失败

**问题**：系统无法读取证书文件

**解决方案**：
- 检查证书目录权限：`ls -la /home/kali/repo/Websites`
- 确保 Docker 容器有权限访问目录
- 检查 `CERTS_DIR` 环境变量配置是否正确

### 4. 数据库连接失败

**问题**：后端无法连接 MySQL

**解决方案**：
- 检查 MySQL 服务是否运行
- 验证数据库用户名和密码
- 确认 MySQL 允许远程连接
- 检查网络连接：`ping $MYSQL_HOST`

---

## 📚 更多文档

- [English Documentation](docs/en/README.md) - 英文版完整文档
- [项目结构说明](docs/STRUCTURE.md) [English](docs/en/STRUCTURE.md) - 详细的代码结构说明
- [API 文档](docs/API.md) [English](docs/en/API.md) - 完整的 API 接口文档
- [部署指南](docs/DEPLOYMENT.md) [English](docs/en/DEPLOYMENT.md) - 详细的部署说明
- [开发指南](docs/DEVELOPMENT.md) [English](docs/en/DEVELOPMENT.md) - 开发环境搭建和开发流程
- [配置说明](docs/CONFIGURATION.md) [English](docs/en/CONFIGURATION.md) - 所有配置项的详细说明

---

## 🔗 相关项目

- **NFX-Edge** - 多网站反向代理系统
- **NFX-Stack** - 公共资源栈

---

## 📝 许可证

本项目为私有项目，未经授权不得使用。

---

## 🤝 支持

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件：lyulucas2003@gmail.com
- 查看文档：[docs/](docs/)

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

<div align="center">
  <strong>NFX-Vault</strong> - 让证书管理变得简单
</div>
