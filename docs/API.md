# NFX-Vault API 文档

本文档描述 NFX-Vault 系统中所有可用的 API 端点。

## 🌐 基础 URL

由仓库根 `.env` 的 `BACKEND_HOST` / `BACKEND_PORT` 决定（Docker Compose 映射到容器内 `8000`）。本地开发常见为 `http://127.0.0.1:10151`（与 Vite 代理一致）。下文示例中的 `10200` 仅作演示，请按你的环境替换。

## 📋 API 概览

NFX-Vault API 遵循 RESTful 原则，使用 JSON 作为请求/响应数据。

### 认证

目前，API 不需要认证。生产环境使用时，请实现适当的认证机制。

### 响应格式

所有 API 响应遵循标准格式：

**成功响应：**
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "错误消息",
  "code": "ERROR_CODE"
}
```

---

## 📡 API 端点

所有 API 端点都以 `/vault` 为前缀。API 分为三个主要组：
- `/vault/tls` - TLS 证书管理
- `/vault/file` - 文件操作
- `/vault/analysis` - 证书分析

### TLS 证书端点

#### 1. 检查证书

从数据库获取证书列表（支持分页）。

**端点：**
```http
GET /vault/tls/check/{store}
```

**路径参数：**
- `store` (string, 必需)：证书存储
  - `websites` - 网站证书
  - `apis` - API 证书

**查询参数：**
- `offset` (integer, 可选)：分页偏移量（默认：0）
- `limit` (integer, 可选)：每页数量（默认：20，最大：100）

**响应：**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "uuid",
        "store": "websites",
        "domain": "example.com",
        "folder_name": "example.com",
        "source": "auto",
        "status": "success",
        "issuer": "Let's Encrypt",
        "not_before": "2024-01-01T00:00:00",
        "not_after": "2024-04-01T00:00:00",
        "is_valid": true,
        "days_remaining": 30,
        "sans": ["example.com", "www.example.com"]
      }
    ],
    "total": 1,
    "offset": 0,
    "limit": 20
  }
}
```

**示例：**
```bash
curl "http://192.168.1.64:10200/vault/tls/check/websites?offset=0&limit=20"
```

---

#### 2. 通过 ID 获取证书详情

通过 ID 获取特定证书的详细信息。

**端点：**
```http
GET /vault/tls/detail-by-id/{certificate_id}
```

**路径参数：**
- `certificate_id` (string, 必需)：证书 UUID

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "store": "websites",
    "domain": "example.com",
    "certificate": "-----BEGIN CERTIFICATE-----...",
    "private_key": "-----BEGIN PRIVATE KEY-----...",
    "issuer": "Let's Encrypt",
    "not_before": "2024-01-01T00:00:00",
    "not_after": "2024-04-01T00:00:00",
    "is_valid": true,
    "days_remaining": 30,
    "sans": ["example.com", "www.example.com"]
  }
}
```

**示例：**
```bash
curl http://192.168.1.64:10200/vault/tls/detail-by-id/{certificate_id}
```

---

#### 3. 刷新证书

手动触发证书文件读取（发布 Kafka 事件）。

**端点：**
```http
POST /vault/tls/refresh/{store}
```

**路径参数：**
- `store` (string, 必需)：证书存储（`websites` 或 `apis`）

**响应：**
```json
{
  "success": true,
  "message": "证书刷新事件已发布：websites",
  "processed": 0
}
```

**示例：**
```bash
curl -X POST http://192.168.1.64:10200/vault/tls/refresh/websites
```

---

#### 4. 搜索证书

按域名或其他条件搜索证书。

**端点：**
```http
POST /vault/tls/search
```

**请求体：**
```json
{
  "store": "websites",
  "domain": "example.com",
  "offset": 0,
  "limit": 20
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "certificates": [ ... ],
    "total": 1
  }
}
```

---

#### 5. 创建证书

创建新证书（手动添加）。

**端点：**
```http
POST /vault/tls/create
```

**请求体：**
```json
{
  "store": "websites",
  "domain": "example.com",
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "private_key": "-----BEGIN PRIVATE KEY-----...",
  "email": "admin@example.com"
}
```

---

#### 6. 应用证书

将证书应用到 Traefik。

**端点：**
```http
POST /vault/tls/apply
```

**请求体：**
```json
{
  "certificate_id": "uuid",
  "store": "websites"
}
```

---

### 文件操作端点

#### 1. 导出证书

将证书导出到导出目录。

**端点：**
```http
POST /vault/file/export/{store}
```

**路径参数：**
- `store` (string, 必需)：证书存储（`websites` 或 `apis`）

**响应：**
```json
{
  "success": true,
  "message": "证书导出成功",
  "processed": 2
}
```

**示例：**
```bash
curl -X POST http://192.168.1.64:10200/vault/file/export/websites
```

---

#### 2. 导出单个证书

将单个证书导出到指定文件夹。

**端点：**
```http
POST /vault/file/export-single
```

**请求体：**
```json
{
  "certificate_id": "uuid",
  "store": "websites",
  "folder_name": "example.com"
}
```

---

#### 3. 列出目录

列出目录内容。

**端点：**
```http
GET /vault/file/list/{store}
```

**路径参数：**
- `store` (string, 必需)：证书存储

**查询参数：**
- `path` (string, 可选)：要列出的子路径

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "example.com",
        "type": "directory",
        "path": "example.com"
      }
    ]
  }
}
```

---

#### 4. 下载文件

下载文件。

**端点：**
```http
GET /vault/file/download/{store}?path={file_path}
```

**路径参数：**
- `store` (string, 必需)：证书存储

**查询参数：**
- `path` (string, 必需)：文件路径

**响应：** 文件内容（二进制）

---

#### 5. 获取文件内容

以文本形式获取文件内容。

**端点：**
```http
GET /vault/file/content/{store}?path={file_path}
```

**路径参数：**
- `store` (string, 必需)：证书存储

**查询参数：**
- `path` (string, 必需)：文件路径

**响应：**
```json
{
  "success": true,
  "data": {
    "content": "文件内容",
    "mime_type": "text/plain"
  }
}
```

---

#### 6. 删除文件或文件夹

删除文件或文件夹（通过 Kafka 事件）。

**端点：**
```http
DELETE /vault/file/delete
```

**请求体：**
```json
{
  "store": "websites",
  "path": "example.com"
}
```

---

### 分析端点

#### 1. 分析 TLS 证书

通过上传或粘贴证书和私钥来分析 TLS 证书。

**端点：**
```http
POST /vault/analysis/tls
```

**请求体：**
```json
{
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "private_key": "-----BEGIN PRIVATE KEY-----..."
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "issuer": "Let's Encrypt",
    "not_before": "2024-01-01T00:00:00",
    "not_after": "2024-04-01T00:00:00",
    "is_valid": true,
    "days_remaining": 30,
    "sans": ["example.com"]
  }
}
```

---

### ACME 挑战端点

#### ACME HTTP-01 挑战

用于 Let's Encrypt 域名验证的 ACME 挑战端点。

**端点：**
```http
GET /.well-known/acme-challenge/{token}
```

**路径参数：**
- `token` (string, 必需)：ACME 挑战令牌

**响应：** 纯文本（密钥授权）

---

### 健康检查

检查 API 服务健康状态。

**端点：**
```http
GET /health
```

**响应：**
```json
{
  "status": "healthy",
  "service": "api",
  "database": "connected",
  "redis": "connected"
}
```

**示例：**
```bash
curl http://192.168.1.64:10200/health
```

---

## 🔍 交互式 API 文档

API 通过 Swagger UI 和 ReDoc 提供交互式文档：

- **Swagger UI**: http://your-host:10200/docs
- **ReDoc**: http://your-host:10200/redoc

您可以直接从这些界面测试 API 端点。

**注意：** 所有 API 端点都以 `/vault` 为前缀：
- TLS 端点：`/vault/tls/*`
- 文件端点：`/vault/file/*`
- 分析端点：`/vault/analysis/*`
- ACME 挑战：`/.well-known/acme-challenge/*`

---

## ⚠️ 错误代码

| 代码 | 描述 |
|------|------|
| `CERT_NOT_FOUND` | 证书未找到 |
| `INVALID_CERT_TYPE` | 无效的证书类型 |
| `EXPORT_FAILED` | 证书导出失败 |
| `DATABASE_ERROR` | 数据库操作错误 |
| `FILE_READ_ERROR` | 文件读取错误 |
| `VALIDATION_ERROR` | 请求验证错误 |

---

## 📝 注意事项

1. 所有时间戳使用 ISO 8601 格式（UTC）
2. 域名应为小写
3. 证书类型区分大小写（`websites`，`apis`）
4. 大型响应可能分页
5. 可能应用速率限制（根据需要配置）

---

## 🔐 安全建议

生产环境使用：

1. 实现认证（JWT、API 密钥等）
2. 为 API 端点启用 HTTPS
3. 实现速率限制
4. 添加请求验证
5. 记录所有 API 请求
6. 适当使用 CORS 限制

---

## 📚 其他资源

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [OpenAPI 规范](https://swagger.io/specification/)
- [项目结构](STRUCTURE.md) [English](en/STRUCTURE.md)
- [配置指南](CONFIGURATION.md) [English](en/CONFIGURATION.md)

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**相关文档**：
- [English Version](en/API.md)
- [部署指南](DEPLOYMENT.md)
- [开发指南](DEVELOPMENT.md)
