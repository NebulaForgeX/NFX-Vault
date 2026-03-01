#!/usr/bin/env bash
# NFX-Vault 启动脚本 / Start script
# 在项目目录下执行: sudo docker compose -f docker-compose.yml up -d --build

cd "$(dirname "${BASH_SOURCE[0]}")"
sudo docker compose -f docker-compose.yml up -d --build
