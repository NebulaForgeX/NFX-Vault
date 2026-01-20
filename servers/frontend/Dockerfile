# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 声明构建参数（用于构建时传递环境变量）
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=10151

# 设置环境变量供构建过程使用
ENV BACKEND_HOST=${BACKEND_HOST}
ENV BACKEND_PORT=${BACKEND_PORT}

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --prefer-offline --no-audit

# 验证 react-hook-form 已安装
RUN npm list react-hook-form

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

