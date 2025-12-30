FROM python:3.11-slim

# 设置工作目录（backend 根目录）
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    openssl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt
COPY requirements.txt .

# 卸载可能存在的错误 kafka 包（预防性措施）
RUN pip3 uninstall -y kafka || true

# 安装 Python 依赖
RUN pip3 install --no-cache-dir -r requirements.txt

# 复制整个 backend 目录
COPY . .

# 启动命令（运行 Pipeline 服务）
# 使用 PYTHONPATH 确保可以导入模块
ENV PYTHONPATH=/app
CMD ["python", "-m", "inputs.pipeline.main"]

