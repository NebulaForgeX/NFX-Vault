# NFX-Vault API: FastAPI + uvicorn（与 docker-compose `backend-api` / traefik 对齐）
FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends certbot openssl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
# 部分 NAS / 容器运行时会给进程极短的 PATH，显式保证镜像内解释器目录可被解析（仍是容器内路径，不是宿主机）
ENV PATH="/usr/local/bin:/usr/bin:/bin:${PATH}"

EXPOSE 8000

# 使用镜像内绝对路径：exec 解析的是「容器文件系统」里的 /usr/local/bin/python3，与宿主机是否安装 Python 无关
CMD ["/usr/local/bin/python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
