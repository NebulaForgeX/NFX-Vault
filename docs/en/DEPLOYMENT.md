# NFX-Vault Deployment Guide

This document provides detailed instructions for deploying NFX-Vault in various environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Production Deployment](#production-deployment)
- [Development Deployment](#development-deployment)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Network Configuration](#network-configuration)
- [Security Considerations](#security-considerations)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 11+, or OpenWrt)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk**: Minimum 10GB free space
- **Network**: Ports 10199, 10200 available

### Required Services

1. **MySQL** 8.0+
   - For storing certificate metadata
   - Create database: `nfxvault`

2. **Redis** 6.0+
   - For caching
   - Default port: 6379

3. **Kafka** 2.8+
   - For message queue
   - Default port: 9092

### Software Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install jq (for command-line tools)
sudo apt-get update
sudo apt-get install -y jq
```

---

## Production Deployment

### Step 1: Prepare Directory Structure

```bash
# Create main directory
sudo mkdir -p /home/kali/repo
cd /home/kali/repo

# Create certificate storage directories
sudo mkdir -p Websites/exported
sudo mkdir -p Apis/exported

# Create certificate files with proper permissions
sudo touch Websites/acme.json
sudo touch Apis/acme.json
sudo chmod 600 Websites/acme.json
sudo chmod 600 Apis/acme.json

# Create docs directory
sudo mkdir -p docs
```

### Step 2: Clone or Copy Project Files

```bash
# Option 1: Git clone
git clone <repository-url> /home/kali/repo

# Option 2: Copy files manually
# Copy all project files to /home/kali/repo
```

### Step 3: Configure Environment Variables

```bash
# Copy template
cp .example.env .env

# Edit configuration
sudo nano .env
```

**Critical Production Settings:**

```bash
# Use production database credentials
MYSQL_ROOT_PASSWORD=strong_secure_password_here

# Use production Redis password
REDIS_PASSWORD=strong_redis_password_here

# Configure proper host addresses
BACKEND_HOST=your-server-ip
FRONTEND_HOST=your-server-ip

# Enable scheduling
SCHEDULE_ENABLED=true
READ_ON_STARTUP=true
```

### Step 4: Create Docker Networks

```bash
# Create internal network
docker network create nfx-vault

# Create external network (if using Traefik)
docker network create nfx-edge
```

### Step 5: Initialize Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE nfxvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, for better security)
CREATE USER 'nfxvault'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON nfxvault.* TO 'nfxvault'@'%';
FLUSH PRIVILEGES;
```

### Step 6: Start Services

```bash
cd /home/kali/repo

# Build and start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 7: Verify Deployment

```bash
# Check API health
curl http://your-server-ip:10200/health

# Check frontend
curl http://your-server-ip:10199

# Check API documentation
curl http://your-server-ip:10200/docs
```

---

## Development Deployment

### Quick Start for Development

```bash
# Clone project
git clone <repository-url> /home/kali/repo
cd /home/kali/repo

# Copy environment file
cp .example.env .env

# Edit .env with development settings
nano .env

# Start services
docker compose up -d

# View logs
docker compose logs -f
```

### Development Environment Variables

```bash
# Use development database
MYSQL_HOST=localhost
MYSQL_ROOT_PASSWORD=dev_password

# Use development Redis
REDIS_HOST=localhost
REDIS_PASSWORD=

# Enable hot reload (if developing)
# Frontend: npm run dev in server/frontend
# Backend: uvicorn main:app --reload
```

---

## Docker Compose Configuration

### Service Configuration

The `docker-compose.yml` defines three main services:

1. **backend-api**: HTTP API service
   - Port: 10200
   - Depends on: MySQL, Redis, Kafka

2. **backend-pipeline**: Kafka consumer service
   - No external ports
   - Processes async events

3. **frontend**: Web interface
   - Port: 10199
   - Nginx serving React app

### Volume Mounts

```yaml
volumes:
  - /home/kali/repo:/home/kali/repo:rw          # Certificate storage
  - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker socket
  - /tmp/acme-challenges:/tmp/acme-challenges:rw  # ACME challenges
```

### Network Configuration

```yaml
networks:
  nfx-vault:    # Internal network
  nfx-edge:     # External network (for Traefik)
```

---

## Network Configuration

### Firewall Rules

```bash
# Allow frontend port
sudo ufw allow 10199/tcp

# Allow backend API port
sudo ufw allow 10200/tcp

# Allow MySQL (if remote)
sudo ufw allow 3306/tcp

# Allow Redis (if remote)
sudo ufw allow 6379/tcp

# Allow Kafka (if remote)
sudo ufw allow 9092/tcp
```

### Reverse Proxy (Nginx)

Example Nginx configuration:

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

## Security Considerations

### 1. Environment Variables

- Never commit `.env` file to version control
- Use strong passwords for production
- Rotate credentials regularly
- Use secrets management (Docker secrets, Vault, etc.)

### 2. File Permissions

```bash
# Certificate files should be 600
chmod 600 Websites/acme.json
chmod 600 Apis/acme.json

# Directory permissions
chmod 700 Websites
chmod 700 Apis
```

### 3. Network Security

- Use internal Docker networks
- Restrict external access
- Use firewall rules
- Enable HTTPS (via reverse proxy)

### 4. Container Security

- Run containers as non-root user
- Use read-only filesystems where possible
- Keep images updated
- Scan for vulnerabilities

---

## Monitoring and Logging

### Log Management

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend-api
docker compose logs -f backend-pipeline
docker compose logs -f frontend

# Export logs
docker compose logs > nfx-vault.log
```

### Health Checks

```bash
# API health check
curl http://localhost:10200/health

# Container status
docker compose ps

# Resource usage
docker stats
```

### Monitoring Tools

Consider integrating:
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **ELK Stack** - Log aggregation
- **Sentry** - Error tracking

---

## Backup and Recovery

### Backup Strategy

1. **Certificate Files**
   ```bash
   # Backup certificate directories
   tar -czf certs-backup-$(date +%Y%m%d).tar.gz Websites/ Apis/
   ```

2. **Database**
   ```bash
   # Backup MySQL database
   mysqldump -u root -p nfxvault > nfxvault-backup-$(date +%Y%m%d).sql
   ```

3. **Configuration**
   ```bash
   # Backup configuration
   cp .env .env.backup
   cp docker-compose.yml docker-compose.yml.backup
   ```

### Recovery Procedure

1. **Restore Certificates**
   ```bash
   tar -xzf certs-backup-YYYYMMDD.tar.gz
   ```

2. **Restore Database**
   ```bash
   mysql -u root -p nfxvault < nfxvault-backup-YYYYMMDD.sql
   ```

3. **Restart Services**
   ```bash
   docker compose down
   docker compose up -d
   ```

---

## Troubleshooting

### Common Issues

#### 1. Containers Won't Start

```bash
# Check logs
docker compose logs

# Check port conflicts
netstat -tuln | grep 10199
netstat -tuln | grep 10200

# Check disk space
df -h

# Check Docker daemon
docker info
```

#### 2. Database Connection Errors

```bash
# Test MySQL connection
mysql -h $MYSQL_HOST -u $MYSQL_ROOT_USERNAME -p

# Check MySQL is running
systemctl status mysql

# Check network connectivity
ping $MYSQL_HOST
```

#### 3. Certificate Read Errors

```bash
# Check permissions
ls -la /home/kali/repo/Websites

# Check Docker volume mount
docker compose exec backend-api ls -la /home/kali/repo

# Check SELinux (if applicable)
getenforce
```

#### 4. Frontend Not Loading

```bash
# Check frontend container
docker compose logs frontend

# Check nginx configuration
docker compose exec frontend cat /etc/nginx/nginx.conf

# Test API connectivity from frontend
docker compose exec frontend curl http://backend-api:8000/health
```

### Debug Mode

Enable debug logging:

```bash
# In .env file
PYTHONUNBUFFERED=1
LOG_LEVEL=DEBUG
```

---

## Performance Tuning

### Resource Limits

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

### Database Optimization

- Enable query caching
- Add appropriate indexes
- Regular maintenance

### Redis Optimization

- Configure memory limits
- Enable persistence if needed
- Tune cache TTL

---

## Updates and Maintenance

### Updating Services

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database Migrations

```bash
# Run migrations (if applicable)
docker compose exec backend-api python manage.py migrate
```

---

## Next Steps

After deployment:

1. Configure reverse proxy (if needed)
2. Set up SSL certificates
3. Configure monitoring
4. Set up backups
5. Review security settings
6. Test all functionality

For more information, see:
- [Configuration Guide](CONFIGURATION.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](API.md)

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

**Related Documentation**:
- [Chinese Version](../DEPLOYMENT.md)
- [Configuration Guide](CONFIGURATION.md)
- [Development Guide](DEVELOPMENT.md)

