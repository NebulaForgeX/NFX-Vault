# NFX-Vault Configuration Guide

This document provides detailed explanations of all configuration options in NFX-Vault.

## 📋 Table of Contents

- [Environment Variables](#environment-variables)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Backend Configuration](#backend-configuration)
- [Frontend Configuration](#frontend-configuration)
- [Database Configuration](#database-configuration)
- [Security Configuration](#security-configuration)
- [Performance Tuning](#performance-tuning)

---

## Environment Variables

All configuration is done through the `.env` file. Copy `.example.env` to `.env` and modify as needed.

### Service Ports

```bash
# Backend API service host and port
BACKEND_HOST=192.168.1.64          # Host IP address
BACKEND_PORT=10200                 # Backend API port

# Frontend service host and port
FRONTEND_HOST=192.168.1.64         # Host IP address
FRONTEND_PORT=10199                # Frontend web port
```

**Notes:**
- Use `0.0.0.0` to bind to all interfaces
- Use specific IP for security
- Ensure ports are not in use by other services

---

### MySQL Database Configuration

```bash
# MySQL server host
MYSQL_HOST=192.168.1.64            # MySQL server IP or hostname

# MySQL port
MYSQL_DATABASE_PORT=3306            # Default MySQL port

# Database name
MYSQL_DATABASE=nfxvault            # Database name

# Database credentials
MYSQL_ROOT_USERNAME=root            # MySQL username
MYSQL_ROOT_PASSWORD=your_password   # MySQL password
```

**Security Recommendations:**
- Use strong passwords
- Create dedicated database user (not root)
- Restrict network access
- Enable SSL connections for remote access

**Connection String Format:**
```
mysql+pymysql://{username}:{password}@{host}:{port}/{database}
```

---

### Redis Cache Configuration

```bash
# Redis server host
REDIS_HOST=192.168.1.64             # Redis server IP or hostname

# Redis port
REDIS_DATABASE_PORT=6379            # Default Redis port

# Redis database number
REDIS_DB=0                          # Database number (0-15)

# Redis password
REDIS_PASSWORD=your_redis_password  # Leave empty if no password

# Cache TTL (Time To Live) in seconds
REDIS_CACHE_TTL=3600                # 1 hour default
```

**Notes:**
- Use different `REDIS_DB` numbers for different environments
- Set `REDIS_CACHE_TTL` based on your needs
- Longer TTL = less database queries, but potentially stale data

---

### Kafka Message Queue Configuration

```bash
# Kafka bootstrap servers
KAFKA_BOOTSTRAP_SERVERS=192.168.1.64:9092  # Comma-separated list

# Kafka topics
KAFKA_EVENT_TOPIC=nfxvault.cert_server              # Main event topic
KAFKA_EVENT_POISON_TOPIC=nfxvault.cert_server.poison # Dead letter topic

# Consumer group ID
KAFKA_CONSUMER_GROUP_ID=nfxvault-cert-server        # Consumer group
```

**Notes:**
- Multiple brokers: `broker1:9092,broker2:9092`
- Topics are created automatically if auto-create is enabled
- Poison topic stores failed messages for debugging

---

### Certificate Management Configuration

```bash
# Certificate storage root directory
CERTS_DIR=/home/kali/repo            # Absolute path to certificates

# ACME challenge directory
ACME_CHALLENGE_DIR=/tmp/acme-challenges  # Directory for ACME challenges

# Maximum wait time for certificate operations (seconds)
CERT_MAX_WAIT_TIME=360              # 6 minutes default
```

**Directory Structure:**
```
CERTS_DIR/
├── Websites/
│   ├── acme.json
│   └── exported/
└── Apis/
    ├── acme.json
    └── exported/
```

**Permissions:**
```bash
# Certificate files should be 600
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# Directories should be 700
chmod 700 Websites
chmod 700 Apis
```

---

### Scheduling Configuration

```bash
# Read certificates on startup
READ_ON_STARTUP=true                # true/false

# Enable scheduled tasks
SCHEDULE_ENABLED=true              # true/false

# Weekly schedule - Day of week
SCHEDULE_WEEKLY_DAY=mon             # mon, tue, wed, thu, fri, sat, sun

# Weekly schedule - Hour
SCHEDULE_WEEKLY_HOUR=2               # 0-23 (24-hour format)

# Weekly schedule - Minute
SCHEDULE_WEEKLY_MINUTE=0             # 0-59
```

**Schedule Examples:**
```bash
# Every Monday at 2:00 AM
SCHEDULE_WEEKLY_DAY=mon
SCHEDULE_WEEKLY_HOUR=2
SCHEDULE_WEEKLY_MINUTE=0

# Every Sunday at midnight
SCHEDULE_WEEKLY_DAY=sun
SCHEDULE_WEEKLY_HOUR=0
SCHEDULE_WEEKLY_MINUTE=0
```

**Note:** Certificate status update task runs daily at 1:00 AM (not configurable).

---

## Docker Compose Configuration

### Service Configuration

The `docker-compose.yml` file defines service configurations:

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
      - /home/kali/repo:/home/kali/repo:rw
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /tmp/acme-challenges:/tmp/acme-challenges:rw
    environment:
      - PYTHONUNBUFFERED=1
      # ... other environment variables
    networks:
      - nfx-vault
      - nfx-edge
```

### Volume Mounts

- `/home/kali/repo:/home/kali/repo:rw` - Certificate storage (read-write)
- `/var/run/docker.sock:/var/run/docker.sock:ro` - Docker socket (read-only)
- `/tmp/acme-challenges:/tmp/acme-challenges:rw` - ACME challenges (read-write)

### Networks

- `nfx-vault`: Internal bridge network for service communication
- `nfx-edge`: External network for Traefik integration (must exist)

---

## Backend Configuration

### Application Settings

Backend configuration is loaded from environment variables and can be accessed via:

```python
from modules.configs import load_config, DatabaseConfig, CertConfig

# Load configuration
cert_config, db_config = load_config()

# Access configuration
db_host = db_config.MYSQL_HOST
cert_dir = cert_config.BASE_DIR
```

### Logging Configuration

```python
# Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=DEBUG  # Set in .env

# Python unbuffered output
PYTHONUNBUFFERED=1  # Recommended for Docker
```

### Database Connection Pool

Configured in SQLAlchemy:

```python
# Connection pool settings (in code)
pool_size=10
max_overflow=20
pool_timeout=30
```

---

## Frontend Configuration

### API Base URL

Configured in `src/apis/config.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10200';
```

Set via environment variable:
```bash
VITE_API_BASE_URL=http://192.168.1.64:10200
```

### Build Configuration

`vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 5173,  // Development server port
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

## Database Configuration

### MySQL Settings

Recommended MySQL configuration (`my.cnf`):

```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_type = 1
query_cache_size = 64M
```

### Database Schema

The main database table is created automatically on first run:

- `tls_certificates` - TLS certificate metadata
  - Stores all certificate information including domain, issuer, validity, certificate content, private key
  - Indexed by store, domain, source, and folder_name
  - Unique constraint on (domain, source, store)

---

## Security Configuration

### File Permissions

```bash
# Certificate files
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# Directories
chmod 700 Websites
chmod 700 Apis

# Configuration file
chmod 600 .env
```

### Network Security

1. **Firewall Rules:**
   ```bash
   # Allow only specific IPs
   ufw allow from 192.168.1.0/24 to any port 10200
   ```

2. **Docker Networks:**
   - Use internal networks for service communication
   - Limit external network access

3. **Reverse Proxy:**
   - Use Nginx/Traefik with SSL
   - Enable rate limiting
   - Configure CORS properly

### Environment Variables Security

- Never commit `.env` to version control
- Use secrets management in production
- Rotate credentials regularly
- Use strong passwords

---

## Performance Tuning

### Database Optimization

```bash
# Connection pool size
# Increase for high traffic
MYSQL_POOL_SIZE=20

# Query timeout
MYSQL_QUERY_TIMEOUT=30
```

### Redis Optimization

```bash
# Cache TTL
REDIS_CACHE_TTL=3600  # Adjust based on update frequency

# Connection pool
REDIS_MAX_CONNECTIONS=50
```

### Container Resources

Add to `docker-compose.yml`:

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

## Configuration Validation

### Check Configuration

```bash
# Validate environment variables
docker compose config

# Test database connection
docker compose exec backend-api python -c "from config.settings import settings; print(settings.MYSQL_HOST)"

# Test Redis connection
docker compose exec backend-api python -c "import redis; r = redis.Redis(host='$REDIS_HOST'); r.ping()"
```

### Common Configuration Issues

1. **Port Conflicts:**
   ```bash
   # Check if ports are in use
   netstat -tuln | grep 10199
   netstat -tuln | grep 10200
   ```

2. **Permission Issues:**
   ```bash
   # Check file permissions
   ls -la /home/kali/repo/Websites
   ```

3. **Network Issues:**
   ```bash
   # Test connectivity
   ping $MYSQL_HOST
   telnet $REDIS_HOST $REDIS_DATABASE_PORT
   ```

---

## Configuration Examples

### Development Environment

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

### Production Environment

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

## Additional Resources

- [Deployment Guide](DEPLOYMENT.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](API.md)
- [Project Structure](STRUCTURE.md)

For specific configuration questions, please refer to the source code or contact the development team.

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

**Related Documentation**:
- [Chinese Version](../CONFIGURATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Development Guide](DEVELOPMENT.md)

