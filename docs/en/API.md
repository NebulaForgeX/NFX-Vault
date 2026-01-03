# NFX-Vault API Documentation

This document describes all available API endpoints in the NFX-Vault system.

## 🌐 Base URL

```
http://your-host:10200
```

## 📋 API Overview

The NFX-Vault API follows RESTful principles and uses JSON for request/response data.

### Authentication

Currently, the API does not require authentication. For production use, please implement appropriate authentication mechanisms.

### Response Format

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 📡 API Endpoints

All API endpoints are prefixed with `/vault`. The API is organized into three main groups:
- `/vault/tls` - TLS certificate management
- `/vault/file` - File operations
- `/vault/analysis` - Certificate analysis

### TLS Certificate Endpoints

#### 1. Check Certificates

Get certificate list from database with pagination.

**Endpoint:**
```http
GET /vault/tls/check/{store}
```

**Path Parameters:**
- `store` (string, required): Certificate store
  - `websites` - Website certificates
  - `apis` - API certificates

**Query Parameters:**
- `offset` (integer, optional): Offset for pagination (default: 0)
- `limit` (integer, optional): Number of items per page (default: 20, max: 100)

**Response:**
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

**Example:**
```bash
curl "http://192.168.1.64:10200/vault/tls/check/websites?offset=0&limit=20"
```

---

#### 2. Get Certificate Detail by ID

Get detailed information about a specific certificate by ID.

**Endpoint:**
```http
GET /vault/tls/detail-by-id/{certificate_id}
```

**Path Parameters:**
- `certificate_id` (string, required): Certificate UUID

**Response:**
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

**Example:**
```bash
curl http://192.168.1.64:10200/vault/tls/detail-by-id/{certificate_id}
```

---

#### 3. Refresh Certificates

Manually trigger certificate file reading (publishes Kafka event).

**Endpoint:**
```http
POST /vault/tls/refresh/{store}
```

**Path Parameters:**
- `store` (string, required): Certificate store (`websites` or `apis`)

**Response:**
```json
{
  "success": true,
  "message": "Certificate refresh event published for websites",
  "processed": 0
}
```

**Example:**
```bash
curl -X POST http://192.168.1.64:10200/vault/tls/refresh/websites
```

---

#### 4. Search Certificates

Search certificates by domain or other criteria.

**Endpoint:**
```http
POST /vault/tls/search
```

**Request Body:**
```json
{
  "store": "websites",
  "domain": "example.com",
  "offset": 0,
  "limit": 20
}
```

**Response:**
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

#### 5. Create Certificate

Create a new certificate (manual add).

**Endpoint:**
```http
POST /vault/tls/create
```

**Request Body:**
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

#### 6. Apply Certificate

Apply certificate to Traefik.

**Endpoint:**
```http
POST /vault/tls/apply
```

**Request Body:**
```json
{
  "certificate_id": "uuid",
  "store": "websites"
}
```

---

### File Operation Endpoints

#### 1. Export Certificates

Export certificates to exported directory.

**Endpoint:**
```http
POST /vault/file/export/{store}
```

**Path Parameters:**
- `store` (string, required): Certificate store (`websites` or `apis`)

**Response:**
```json
{
  "success": true,
  "message": "Certificates exported successfully",
  "processed": 2
}
```

**Example:**
```bash
curl -X POST http://192.168.1.64:10200/vault/file/export/websites
```

---

#### 2. Export Single Certificate

Export a single certificate to specified folder.

**Endpoint:**
```http
POST /vault/file/export-single
```

**Request Body:**
```json
{
  "certificate_id": "uuid",
  "store": "websites",
  "folder_name": "example.com"
}
```

---

#### 3. List Directory

List directory contents.

**Endpoint:**
```http
GET /vault/file/list/{store}
```

**Path Parameters:**
- `store` (string, required): Certificate store

**Query Parameters:**
- `path` (string, optional): Subpath to list

**Response:**
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

#### 4. Download File

Download a file.

**Endpoint:**
```http
GET /vault/file/download/{store}?path={file_path}
```

**Path Parameters:**
- `store` (string, required): Certificate store

**Query Parameters:**
- `path` (string, required): File path

**Response:** File content (binary)

---

#### 5. Get File Content

Get file content as text.

**Endpoint:**
```http
GET /vault/file/content/{store}?path={file_path}
```

**Path Parameters:**
- `store` (string, required): Certificate store

**Query Parameters:**
- `path` (string, required): File path

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "file content here",
    "mime_type": "text/plain"
  }
}
```

---

#### 6. Delete File or Folder

Delete a file or folder (via Kafka event).

**Endpoint:**
```http
DELETE /vault/file/delete
```

**Request Body:**
```json
{
  "store": "websites",
  "path": "example.com"
}
```

---

### Analysis Endpoints

#### 1. Analyze TLS Certificate

Analyze a TLS certificate by uploading or pasting certificate and private key.

**Endpoint:**
```http
POST /vault/analysis/tls
```

**Request Body:**
```json
{
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "private_key": "-----BEGIN PRIVATE KEY-----..."
}
```

**Response:**
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

### ACME Challenge Endpoint

#### ACME HTTP-01 Challenge

ACME challenge endpoint for Let's Encrypt domain validation.

**Endpoint:**
```http
GET /.well-known/acme-challenge/{token}
```

**Path Parameters:**
- `token` (string, required): ACME challenge token

**Response:** Plain text (key authorization)

---

### 5. Health Check

Check API service health status.

**Endpoint:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00",
  "services": {
    "database": "connected",
    "redis": "connected",
    "kafka": "connected"
  }
}
```

**Example:**
```bash
curl http://192.168.1.64:10200/health
```

---

## 🔍 Interactive API Documentation

The API provides interactive documentation through Swagger UI and ReDoc:

- **Swagger UI**: http://your-host:10200/docs
- **ReDoc**: http://your-host:10200/redoc

You can test API endpoints directly from these interfaces.

**Note:** All API endpoints are prefixed with `/vault`:
- TLS endpoints: `/vault/tls/*`
- File endpoints: `/vault/file/*`
- Analysis endpoints: `/vault/analysis/*`
- ACME challenge: `/.well-known/acme-challenge/*`

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| `CERT_NOT_FOUND` | Certificate not found |
| `INVALID_CERT_TYPE` | Invalid certificate type |
| `EXPORT_FAILED` | Certificate export failed |
| `DATABASE_ERROR` | Database operation error |
| `FILE_READ_ERROR` | File read error |
| `VALIDATION_ERROR` | Request validation error |

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Domain names should be lowercase
3. Certificate types are case-sensitive (`websites`, `apis`)
4. Large responses may be paginated
5. Rate limiting may apply (configure as needed)

---

## 🔐 Security Recommendations

For production use:

1. Implement authentication (JWT, API keys, etc.)
2. Enable HTTPS for API endpoints
3. Implement rate limiting
4. Add request validation
5. Log all API requests
6. Use CORS restrictions appropriately

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Project Structure](STRUCTURE.md)
- [Configuration Guide](CONFIGURATION.md)

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

**Related Documentation**:
- [Chinese Version](../API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Development Guide](DEVELOPMENT.md)

