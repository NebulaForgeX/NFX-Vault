# NFX-Vault - 密钥管理系统

基于 Web 的 SSL 证书管理和监控系统，提供统一的证书检查、导出和管理功能。

<div align="center">
  <img src="image.png" alt="NFX-Vault Logo" width="200">
</div>

---

## ✨ 特性

- 🔒 **证书管理** - 统一管理 Websites 和 Apis 的 SSL 证书
- 📊 **证书检查** - 实时查看证书状态和过期时间
- 📥 **证书导出** - 一键导出证书文件
- 🌐 **Web 界面** - 基于 React + TypeScript 的现代化 Web 界面
- 🚀 **RESTful API** - 基于 FastAPI 的后端 API
- 🐳 **Docker 支持** - 使用 Docker Compose 一键部署
- 📝 **命令行工具** - 提供交互式命令行工具作为备选

---

## 📁 项目结构

```
Certs/
├── server/                          # NFX-Vault Web 服务
│   ├── frontend/                    # 前端项目（Vite + React + TypeScript）
│   │   ├── src/
│   │   │   ├── apis/               # API 客户端
│   │   │   ├── components/         # 组件
│   │   │   ├── hooks/              # React Hooks
│   │   │   ├── pages/              # 页面
│   │   │   ├── stores/             # 状态管理
│   │   │   ├── types/              # TypeScript 类型
│   │   │   ├── utils/              # 工具函数
│   │   │   ├── providers/          # Context Providers
│   │   │   ├── layouts/            # 布局组件
│   │   │   └── main.tsx            # 入口文件
│   │   ├── Dockerfile              # 前端 Docker 镜像
│   │   └── package.json
│   └── backend/                     # 后端项目（Python FastAPI MVC）
│       ├── app/
│       │   ├── models/             # 数据模型
│       │   ├── views/              # 业务逻辑层
│       │   ├── controllers/        # 控制器（路由）
│       │   └── __init__.py
│       ├── config/                 # 配置文件
│       ├── main.py                 # 应用入口
│       ├── requirements.txt        # Python 依赖
│       └── Dockerfile              # 后端 Docker 镜像
├── cmd.sh                           # 证书管理命令行工具
├── Websites/                        # 网站证书存储
│   ├── acme.json                   # Traefik 证书存储文件
│   └── exported/                   # 导出的证书文件
├── Apis/                            # API 证书存储
│   ├── acme.json                   # Traefik 证书存储文件
│   └── exported/                   # 导出的证书文件
├── cmd.sh                           # 命令行工具入口
├── docker-compose.yml               # Docker Compose 配置
├── docker-compose.example.yml       # Docker Compose 配置模板
├── .env                             # 环境配置文件（需创建）
├── .env.example                     # 环境配置模板
├── .gitignore                       # Git 忽略文件
└── README.md                        # 本文档
```

---

## 🚀 快速开始

### 前置要求

1. **Docker 和 Docker Compose** 已安装
2. **jq**（用于脚本解析 JSON）
   ```bash
   opkg install jq
   ```

   ```bash
   cd /volume1/Certs/Websites
    touch /volume1/Certs/Websites/acme.json
    chmod 600 acme.json
    chmod 600 /volume1/Certs/Websites/acme.json

   cd /volume1/Certs/Apis
   sudo touch acme.json
   sudo chmod 600 acme.json
   sudo chmod 600 /volume1/Certs/Apis/acme.json

   ```

### 使用 Docker Compose 部署（推荐）

1. **配置环境变量**
   ```bash
   cp .env.example .env
   vim .env
   ```

2. **启动服务**
   ```bash
   cd /volume1/Certs
   docker compose up -d
   ```

3. **访问 Web 界面**
   - 前端：http://192.168.1.64:10199
   - 后端 API：http://192.168.1.64:10200
   - API 文档：http://192.168.1.64:10200/docs

### 使用命令行工具

如果不想使用 Web 界面，可以使用命令行工具：

```bash
# 运行交互式证书验证工具
./cmd.sh
```

工具功能：
1. 选择证书类型（websites 或 apis）
2. 扫描并选择子文件夹
3. 验证证书和私钥信息（包括有效期、域名、匹配性等）

---

## 🔧 开发指南

### 前端开发

1. **安装依赖**
   ```bash
   cd server/frontend
   source /volume1/use-menv.sh
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **构建生产版本**
   ```bash
   npm run build
   ```

### 后端开发

1. **安装依赖**
   ```bash
   cd server/backend
   pip install -r requirements.txt
   ```

2. **启动开发服务器**
   ```bash
   python main.py
   # 或使用 uvicorn
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **访问 API 文档**
   - Swagger UI: http://localhost:10200/docs
   - ReDoc: http://localhost:10200/redoc

---

## 📡 API 接口

### 证书检查

```http
GET /api/certs/check/{cert_type}
```

- `cert_type`: `websites` 或 `apis`

**响应示例：**
```json
{
  "certificates": [
    {
      "domain": "example.com",
      "issuer": "Let's Encrypt",
      "not_before": "2024-01-01T00:00:00",
      "not_after": "2024-04-01T00:00:00",
      "is_valid": true,
      "days_remaining": 30
    }
  ],
  "total": 1
}
```

### 证书导出

```http
POST /api/certs/export/{cert_type}
```

- `cert_type`: `websites` 或 `apis`

**响应示例：**
```json
{
  "success": true,
  "message": "Certificates exported successfully",
  "error": null
}
```

---

## ⚙️ 配置说明

### 环境变量（.env）

```bash
# Docker Compose 服务端口
BACKEND_PORT=10200
FRONTEND_PORT=10199

# 证书文件路径
WEBSITES_CERT_FILE=/volume1/Certs/Websites/acme.json
APIS_CERT_FILE=/volume1/Certs/Apis/acme.json

# 证书导出目录
WEBSITES_EXPORT_DIR=/volume1/Certs/Websites/exported
APIS_EXPORT_DIR=/volume1/Certs/Apis/exported

# 需要导出的域名列表
WEBSITES_EXPORT_DOMAINS="sjgztea.com pqttec.com lucaslyu.com"
APIS_EXPORT_DOMAINS="api.example.com"
```

---

## 🛠️ 命令行工具

### cmd.sh

证书管理命令行工具，提供交互式证书验证功能：

```bash
# 运行工具
./cmd.sh
```

**功能**：
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

---

## 🐳 Docker 网络

项目使用独立的 Docker 网络 `nfx-vault`（bridge 模式），确保服务间的隔离和通信。

```yaml
networks:
  nfx-vault:
    name: nfx-vault
    driver: bridge
```

---

## 📝 注意事项

1. **证书文件权限**：确保 Docker 容器有权限读取 `/volume1/Certs` 目录
2. **端口冲突**：确保 `10199` 和 `10200` 端口未被占用
3. **环境变量**：生产环境应限制 CORS 来源
4. **安全性**：`.env` 文件包含敏感信息，不要提交到版本控制

---

## 🔗 相关项目

- **NFX-Edge** (`/volume1/Websites`) - 多网站反向代理系统
- **NFX-Stack** (`/volume1/Resources`) - 公共资源栈

---

## 📄 许可证

本项目为私有项目。
