# NFX-Vault 前端：Vite 构建 + nginx（反代 /vault、/.well-known 至 backend-api）
ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

# 与浏览器同域，由 nginx 转发到 `backend-api:8000`；若 API 独立域名可改为完整 URL
ARG VITE_API_URL=/vault
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
