# NFX-Vault - SSL Certificate Management System

<div align="center">
  <img src="../../image.png" alt="NFX-Vault Logo" width="200">
  
  **Web-based SSL Certificate Management and Monitoring System**
  
  [中文文档](../README.md) | [English](en/README.md) | [项目结构](STRUCTURE.md) | [API 文档](API.md)
</div>

---

## 📖 Introduction

NFX-Vault is a modern SSL certificate management and monitoring system that provides unified certificate checking, export, and management capabilities. The system adopts a frontend-backend separation architecture, supporting both web interface and command-line tools, helping you easily manage SSL certificates for multiple domains.

### ✨ Key Features

- 🔒 **Unified Certificate Management** - Centralized management of SSL certificates for Websites and APIs
- 📊 **Real-time Monitoring** - View certificate status, expiration time, and remaining days
- 📥 **One-click Export** - Quickly export certificate files to specified directories
- 🌐 **Modern Web Interface** - Responsive interface based on React + TypeScript
- 🚀 **RESTful API** - High-performance backend service based on FastAPI
- 🐳 **Docker Deployment** - One-click deployment using Docker Compose
- 📝 **Command-line Tools** - Interactive command-line tool as an alternative
- ⏰ **Automatic Scheduling** - Support for scheduled tasks to automatically check certificate status

---

## 🚀 Quick Start

### Prerequisites

Before starting, please ensure your system has the following software installed:

1. **Docker** and **Docker Compose**
   ```bash
   # Check Docker version
   docker --version
   docker compose version
   ```

2. **jq** (for JSON parsing, required by command-line tools)
   ```bash
   # On OpenWrt systems
   opkg install jq
   
   # On Ubuntu/Debian systems
   sudo apt-get install jq
   ```

3. **MySQL** database (for storing certificate metadata)
4. **Redis** cache service (for performance improvement)
5. **Kafka** message queue (for asynchronous task processing)

### Installation Steps

#### 1. Clone or Download the Project

```bash
cd /volume1
git clone <repository-url> Certs
# Or download and extract to /home/kali/repo
```

#### 2. Create Certificate Storage Directories

```bash
cd /home/kali/repo

# Create Websites certificate directory
mkdir -p Websites/exported
touch Websites/acme.json
chmod 600 Websites/acme.json

# Create Apis certificate directory
mkdir -p Apis/exported
touch Apis/acme.json
chmod 600 Apis/acme.json
```

#### 3. Configure Environment Variables

```bash
# Copy environment variable template
cp .example.env .env

# Edit configuration file
vim .env
# Or use your preferred editor
nano .env
```

**Important Configuration Items:**

```bash
# Docker service ports (modify according to actual situation)
BACKEND_HOST=192.168.1.64
BACKEND_PORT=10200
FRONTEND_HOST=192.168.1.64
FRONTEND_PORT=10199

# MySQL database configuration
MYSQL_HOST=192.168.1.64
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE=nfxvault
MYSQL_ROOT_USERNAME=root
MYSQL_ROOT_PASSWORD=your_mysql_password

# Redis cache configuration
REDIS_HOST=192.168.1.64
REDIS_DATABASE_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# Kafka message queue configuration
KAFKA_BOOTSTRAP_SERVERS=192.168.1.64:9092
KAFKA_EVENT_TOPIC=nfxvault.cert_server
KAFKA_EVENT_POISON_TOPIC=nfxvault.cert_server.poison
KAFKA_CONSUMER_GROUP_ID=nfxvault-cert-server

# Certificate storage directory
CERTS_DIR=/home/kali/repo
ACME_CHALLENGE_DIR=/tmp/acme-challenges

# Scheduling configuration
READ_ON_STARTUP=true          # Read certificates on startup
SCHEDULE_ENABLED=true         # Enable scheduled tasks
SCHEDULE_WEEKLY_DAY=mon       # Execute every Monday
SCHEDULE_WEEKLY_HOUR=2        # At 2 AM
SCHEDULE_WEEKLY_MINUTE=0      # 0 minutes
```

#### 4. Start Services

```bash
cd /home/kali/repo
docker compose up -d
```

#### 5. Verify Installation

Check container status:
```bash
docker compose ps
```

View logs:
```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend-api
docker compose logs -f frontend
```

#### 6. Access Services

- **Frontend Web Interface**: http://192.168.1.64:10199
- **Backend API**: http://192.168.1.64:10200
- **API Documentation (Swagger)**: http://192.168.1.64:10200/docs
- **API Documentation (ReDoc)**: http://192.168.1.64:10200/redoc

---

## 📁 Directory Structure

```
Certs/
├── server/                    # Server-side code
│   ├── backend/              # Backend service (Python FastAPI)
│   └── frontend/             # Frontend application (React + TypeScript)
├── Websites/                 # Website certificate storage directory
│   ├── acme.json            # Traefik certificate storage file
│   └── exported/            # Exported certificate files
├── Apis/                     # API certificate storage directory
│   ├── acme.json            # Traefik certificate storage file
│   └── exported/            # Exported certificate files
├── docs/                     # Project documentation (English)
├── cmd.sh                    # Command-line tool
├── docker-compose.yml        # Docker Compose configuration
├── .example.env              # Environment variable template
└── README.md                 # This document
```

For detailed project structure, please refer to [STRUCTURE.md](STRUCTURE.md). [中文版](../STRUCTURE.md)

---

## 🛠️ Usage Guide

### Web Interface Usage

1. Open your browser and visit the frontend address: `http://your-ip:10199`
2. View the status of all certificates in the interface
3. Click on a certificate to view detailed information
4. Use the export function to export certificates to a specified directory

### Command-line Tool Usage

If you don't want to use the web interface, you can use the command-line tool:

```bash
cd /home/kali/repo
./cmd.sh
```

**Command-line Tool Features:**
- Select certificate type (websites or apis)
- Automatically scan and list all subfolders
- Select subfolder for verification
- Verify certificate details:
  - Certificate and private key file existence
  - Certificate subject, issuer, validity period
  - Domain information (SANs)
  - Private key format verification
  - Certificate and private key matching verification
  - Certificate remaining days (with color warnings)

### API Usage

For detailed API documentation, please refer to [API.md](API.md). [中文版](../API.md)

**Quick Examples:**

```bash
# Check Websites certificates (with pagination)
curl "http://192.168.1.64:10200/vault/tls/check/websites?offset=0&limit=20"

# Export Websites certificates
curl -X POST http://192.168.1.64:10200/vault/file/export/websites

# Refresh certificates (trigger re-read)
curl -X POST http://192.168.1.64:10200/vault/tls/refresh/websites
```

---

## ⚙️ Configuration

### Environment Variables

All configuration items are in the `.env` file, mainly divided into the following categories:

1. **Service Port Configuration** - Access ports for frontend and backend
2. **Database Configuration** - MySQL connection information
3. **Cache Configuration** - Redis connection information
4. **Message Queue Configuration** - Kafka connection information
5. **Certificate Management Configuration** - Certificate storage path and ACME challenge directory
6. **Scheduling Configuration** - Execution time for scheduled tasks

For detailed configuration instructions, please refer to [CONFIGURATION.md](CONFIGURATION.md). [中文版](../CONFIGURATION.md)

### Docker Networks

The project uses independent Docker networks:
- `nfx-vault`: Internal service communication network (bridge mode)
- `nfx-edge`: External network (needs to be created in advance, for communication with Traefik and other reverse proxies)

---

## 🔧 Troubleshooting

### 1. Container Startup Failure

**Problem**: Container cannot start or exits immediately

**Solution**:
- Check if `.env` file configuration is correct
- Check if ports are occupied: `netstat -tuln | grep 10199`
- View container logs: `docker compose logs backend-api`
- Ensure MySQL, Redis, Kafka services are running normally

### 2. Cannot Access Web Interface

**Problem**: Browser cannot open the frontend page

**Solution**:
- Check firewall settings
- Confirm port mapping is correct: `docker compose ps`
- Check frontend container logs: `docker compose logs frontend`

### 3. Certificate Read Failure

**Problem**: System cannot read certificate files

**Solution**:
- Check certificate directory permissions: `ls -la /home/kali/repo/Websites`
- Ensure Docker container has permission to access the directory
- Check if `CERTS_DIR` environment variable is configured correctly

### 4. Database Connection Failure

**Problem**: Backend cannot connect to MySQL

**Solution**:
- Check if MySQL service is running
- Verify database username and password
- Confirm MySQL allows remote connections
- Check network connection: `ping $MYSQL_HOST`

---

## 📚 More Documentation

- [中文文档](../README.md) - Complete Chinese documentation
- [Project Structure](STRUCTURE.md) [中文版](../STRUCTURE.md) - Detailed code structure explanation
- [API Documentation](API.md) [中文版](../API.md) - Complete API interface documentation
- [Deployment Guide](DEPLOYMENT.md) [中文版](../DEPLOYMENT.md) - Detailed deployment instructions
- [Development Guide](DEVELOPMENT.md) [中文版](../DEVELOPMENT.md) - Development environment setup and development process
- [Configuration Guide](CONFIGURATION.md) [中文版](../CONFIGURATION.md) - Detailed explanation of all configuration items

---

## 🔗 Related Projects

- **NFX-Edge** - Multi-website reverse proxy system
- **NFX-Stack** - Public resource stack

---

## 📝 License

This project is a private project and may not be used without authorization.

---

## 🤝 Support

For questions or suggestions, please contact through:

- Submit an Issue
- Send an email: lyulucas2003@gmail.com
- View documentation: [docs/](.)

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

<div align="center">
  <strong>NFX-Vault</strong> - Making Certificate Management Simple
</div>

