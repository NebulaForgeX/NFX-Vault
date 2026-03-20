# NFX-Vault 项目结构

本文档详细说明 NFX-Vault 项目的结构。

## 📁 整体目录结构

```
Certs/
├── backend/                         # 后端服务（Python FastAPI）
│   ├── models/                      # 数据模型（SQLAlchemy）
│   │   ├── base.py                  # 基础模型类
│   │   └── tls_certificate.py       # TLS 证书模型
│   ├── enums/                       # 枚举定义
│   │   ├── certificate_store.py     # 证书存储枚举
│   │   ├── certificate_source.py    # 证书来源枚举
│   │   └── certificate_status.py    # 证书状态枚举
│   ├── events/                      # 事件处理器
│   │   ├── export_certificate_event.py
│   │   └── delete_file_or_folder_event.py
│   ├── inputs/                      # 服务入口点
│   │   ├── api/                     # API 服务入口
│   │   │   └── main.py              # FastAPI HTTP 服务器
│   │   └── pipeline/                # Pipeline 服务入口
│   │       └── main.py              # Kafka 消费者服务器
│   ├── modules/                     # 功能模块
│   │   ├── applications/            # 应用层（业务逻辑）
│   │   ├── interfaces/              # 接口层（HTTP, Kafka）
│   │   │   ├── http/                # HTTP 处理器
│   │   │   │   ├── handler/         # 请求处理器
│   │   │   │   │   ├── tls/         # TLS 证书处理器
│   │   │   │   │   ├── file/        # 文件操作处理器
│   │   │   │   │   └── analysis/    # 分析处理器
│   │   │   │   ├── dto/             # 数据传输对象
│   │   │   │   └── router.py        # 路由注册
│   │   │   └── kafka/               # Kafka 事件处理器
│   │   ├── repositories/            # 仓库层（数据访问）
│   │   │   ├── database/            # 数据库仓库
│   │   │   ├── cache/               # 缓存仓库
│   │   │   └── tls/                 # TLS 文件仓库
│   │   ├── configs/                 # 配置
│   │   │   ├── types.py             # 配置数据类
│   │   │   ├── cert_config.py       # 证书配置加载器
│   │   │   └── database_config.py   # 数据库配置加载器
│   │   └── server/                  # 服务器初始化
│   │       ├── wiring.py            # 依赖注入
│   │       └── resources.py         # 资源管理
│   ├── resources/                   # 静态资源
│   │   └── certbot/                 # Certbot 客户端
│   ├── tasks/                       # 定时任务
│   │   ├── scheduler.py             # 任务调度器设置
│   │   └── update_days_remaining_task.py
│   ├── utils/                       # 工具函数
│   │   └── certificate.py           # 证书工具
│   └── requirements.txt             # Python 依赖
├── frontend/                        # 前端应用（React + TypeScript）
│   ├── src/
│   │   ├── apis/                    # API 客户端
│   │   ├── components/              # React 组件
│   │   ├── hooks/                   # React Hooks
│   │   ├── pages/                   # 页面组件
│   │   ├── stores/                  # 状态管理（Zustand）
│   │   ├── types/                   # TypeScript 类型定义
│   │   ├── utils/                   # 工具函数
│   │   ├── providers/               # Context 提供者
│   │   ├── layouts/                 # 布局组件
│   │   └── main.tsx                 # 入口文件
│   ├── public/                      # 静态资源
│   ├── Dockerfile                   # 前端 Docker 镜像
│   ├── nginx.conf                   # Nginx 配置
│   ├── package.json                 # Node.js 依赖
│   └── vite.config.ts               # Vite 配置
├── scripts/                         # 本地开发启动脚本（可选）
├── Websites/                        # 网站证书存储
│   ├── acme.json                    # Traefik 证书存储文件
│   └── exported/                    # 导出的证书文件
├── Apis/                            # API 证书存储
│   ├── acme.json                    # Traefik 证书存储文件
│   └── exported/                    # 导出的证书文件
├── docs/                            # 项目文档
│   ├── en/                          # 英文文档
│   ├── README.md                    # 中文文档
│   ├── STRUCTURE.md                 # 本文档
│   ├── API.md                       # API 文档
│   ├── DEPLOYMENT.md                # 部署指南
│   ├── DEVELOPMENT.md               # 开发指南
│   └── CONFIGURATION.md             # 配置指南
├── cmd.sh                           # 命令行证书管理工具
├── docker-compose.yml               # Docker Compose 配置
├── .example.env                     # 环境变量模板
├── .env                             # 环境配置（从 .example.env 创建）
├── .gitignore                       # Git 忽略文件
└── README.md                        # 主文档（中文）
```

---

## 🔧 后端结构

### 后端架构

后端采用**分层架构**模式：

```
backend/
├── models/                          # 数据模型（SQLAlchemy ORM）
│   ├── base.py                      # 基础模型类
│   └── tls_certificate.py           # TLS 证书表模型
├── enums/                           # 枚举
│   ├── certificate_store.py         # 存储枚举（websites/apis/database）
│   ├── certificate_source.py        # 来源枚举（auto/manual_apply/manual_add）
│   └── certificate_status.py        # 状态枚举（success/fail/process）
├── events/                          # 事件系统
│   ├── export_certificate_event.py   # 导出证书事件
│   └── delete_file_or_folder_event.py # 删除文件事件
├── inputs/                          # 服务入口点
│   ├── api/                         # HTTP API 服务
│   │   └── main.py                  # FastAPI 应用入口
│   └── pipeline/                    # Kafka 消费者服务
│       └── main.py                  # Pipeline 服务器入口
├── modules/                         # 功能模块
│   ├── applications/                # 应用层（业务逻辑）
│   │   ├── tls/                     # TLS 证书应用
│   │   ├── file/                    # 文件操作应用
│   │   └── analysis/                # 证书分析应用
│   ├── interfaces/                   # 接口层
│   │   ├── http/                    # HTTP API 接口
│   │   │   ├── handler/             # 请求处理器
│   │   │   │   ├── tls/             # TLS 证书 HTTP 处理器
│   │   │   │   ├── file/            # 文件操作 HTTP 处理器
│   │   │   │   └── analysis/        # 分析 HTTP 处理器
│   │   │   ├── dto/                 # 数据传输对象
│   │   │   └── router.py            # 路由注册
│   │   └── kafka/                    # Kafka 事件接口
│   ├── repositories/                 # 仓库层（数据访问）
│   │   ├── database/                # 数据库仓库
│   │   ├── cache/                   # Redis 缓存仓库
│   │   └── tls/                     # TLS 文件仓库
│   ├── configs/                     # 配置
│   │   ├── types.py                 # 配置数据类
│   │   ├── cert_config.py           # 证书配置加载器
│   │   └── database_config.py       # 数据库配置加载器
│   └── server/                      # 服务器初始化
│       ├── wiring.py                # 依赖注入
│       └── resources.py             # 资源管理
├── resources/                       # 静态资源
│   └── certbot/                     # Certbot 客户端
├── tasks/                           # 定时任务
│   ├── scheduler.py                 # APScheduler 设置
│   └── update_days_remaining_task.py # 每日更新任务
└── utils/                           # 工具
    └── certificate.py               # 证书工具函数
```

### 核心组件

#### 1. **Models** (`models/`)
- SQLAlchemy ORM 模型
- 数据库表定义
- 主要模型：`TLSCertificate`（表：`tls_certificates`）

#### 2. **Applications** (`modules/applications/`)
- 业务逻辑层
- 证书处理逻辑
- 文件操作
- 证书分析

#### 3. **Interfaces** (`modules/interfaces/`)
- FastAPI 路由的 HTTP 处理器
- 请求/响应处理
- API 端点定义
- Kafka 事件处理器

#### 4. **Events** (`events/`)
- 事件驱动架构
- Kafka 事件定义
- 事件数据模型

#### 5. **Tasks** (`tasks/`)
- 使用 APScheduler 的定时任务
- 每日证书状态更新（更新剩余天数）
- 任务调度器初始化

#### 6. **Modules** (`modules/`)
- **Applications**：业务逻辑层
  - TLS 证书管理
  - 文件操作
  - 证书分析
- **Interfaces**：API 和事件接口
  - FastAPI 的 HTTP 处理器
  - Kafka 事件处理器
- **Repositories**：数据访问层
  - 数据库仓库（MySQL）
  - 缓存仓库（Redis）
  - TLS 文件仓库
- **Configs**：配置管理
  - 环境变量加载
  - 配置数据类

---

## 🎨 前端结构

### 前端架构

前端使用 **React + TypeScript + Vite** 和现代模式：

```
frontend/
├── src/
│   ├── apis/                        # API 客户端
│   │   └── *.ts                     # Axios API 客户端
│   ├── components/                  # React 组件
│   │   ├── common/                  # 通用组件
│   │   └── */                       # 功能特定组件
│   ├── hooks/                       # 自定义 Hooks
│   │   └── *.ts                     # React hooks
│   ├── pages/                       # 页面组件
│   │   └── *.tsx                    # 路由页面
│   ├── stores/                      # 状态管理
│   │   └── *.ts                     # Zustand stores
│   ├── types/                       # TypeScript 类型
│   │   └── *.ts                     # 类型定义
│   ├── utils/                       # 工具
│   │   └── *.ts                     # 辅助函数
│   ├── providers/                   # Context 提供者
│   │   └── *.tsx                    # React context 提供者
│   ├── layouts/                     # 布局
│   │   └── *.tsx                    # 布局组件
│   └── main.tsx                     # 应用入口
├── public/                          # 静态资源
│   └── */                           # 图片、字体等
└── package.json                     # 依赖
```

### 核心组件

#### 1. **APIs** (`src/apis/`)
- 基于 Axios 的 API 客户端
- 请求/响应拦截器
- 类型安全的 API 调用

#### 2. **Components** (`src/components/`)
- 可复用的 UI 组件
- 功能特定组件
- 通用组件（按钮、模态框等）

#### 3. **Pages** (`src/pages/`)
- 路由级页面组件
- 主应用视图
- 证书列表、详情、导出页面

#### 4. **Stores** (`src/stores/`)
- Zustand 状态管理
- 全局应用状态
- 证书数据状态

#### 5. **Hooks** (`src/hooks/`)
- 自定义 React hooks
- 数据获取 hooks
- UI 交互 hooks

---

## 🐳 Docker 结构

### Docker 服务

项目包含三个主要的 Docker 服务：

1. **backend-api** - HTTP API 服务
   - FastAPI 应用（入口：`inputs/api/main.py`）
   - 处理 REST API 请求
   - 端口：10200
   - 处理 HTTP 请求并发布 Kafka 事件

2. **backend-pipeline** - Kafka 消费者服务
   - Kafka 消费者（入口：`inputs/pipeline/main.py`）
   - 处理异步事件（证书刷新、文件操作）
   - 无外部端口
   - 运行定时任务（APScheduler）

3. **frontend** - Web 界面
   - Nginx 提供 React 应用
   - 端口：10199
   - 代理 API 请求到 backend-api

### Docker 网络

- **nfx-vault**：用于服务通信的内部桥接网络
- **nfx-edge**：用于与 Traefik 集成的外部网络

---

## 📂 证书存储结构

### Websites 目录

```
Websites/
├── acme.json                        # Traefik ACME 证书存储
└── exported/                        # 导出的证书
    └── {domain}/                    # 域名特定导出
        ├── cert.pem
        ├── key.pem
        └── fullchain.pem
```

### Apis 目录

```
Apis/
├── acme.json                        # Traefik ACME 证书存储
└── exported/                        # 导出的证书
    └── {domain}/                    # 域名特定导出
        ├── cert.pem
        ├── key.pem
        └── fullchain.pem
```

---

## 🔄 数据流

### 证书检查流程

```
用户请求 → 前端 → 后端 API → 数据库查询 → 响应
```

### 证书刷新流程

```
用户请求 → 后端 API → Kafka 事件 → Pipeline 服务 → 文件系统读取 → 数据库更新
```

### 证书导出流程

```
用户请求 → 后端 API → Kafka 事件 → Pipeline 服务 → 文件导出 → 响应
```

### 定时任务流程

```
APScheduler（Pipeline 服务）→ 更新剩余天数任务 → 数据库更新
```

---

## 📦 依赖

### 后端依赖

- **FastAPI** - Web 框架
- **SQLAlchemy** - ORM
- **Redis** - 缓存
- **Kafka** - 消息队列
- **APScheduler** - 任务调度
- **Docker** - 容器管理

### 前端依赖

- **React** - UI 库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **React Query** - 数据获取
- **Axios** - HTTP 客户端

---

## 🔐 安全考虑

1. **证书文件**：使用 `600` 权限存储
2. **环境变量**：敏感数据在 `.env` 中（不在 git 中）
3. **Docker 网络**：隔离的网络通信
4. **API 认证**：（根据需要配置）

---

## 📝 注意事项

- 所有路径使用绝对路径（`/home/kali/repo`）
- Docker 卷挂载证书目录
- 服务通过 Docker 网络通信
- 前端代理 API 请求到后端

有关特定组件的更多详细信息，请参考源代码和内联文档。

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**相关文档**：
- [English Version](en/STRUCTURE.md)
- [API 文档](API.md)
- [配置指南](CONFIGURATION.md)
