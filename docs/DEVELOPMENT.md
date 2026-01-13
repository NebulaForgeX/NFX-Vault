# NFX-Vault 开发指南

本文档提供设置开发环境和为 NFX-Vault 做贡献的说明。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [后端开发](#后端开发)
- [前端开发](#前端开发)
- [代码规范和标准](#代码规范和标准)
- [测试](#测试)
- [调试](#调试)
- [Git 工作流](#git-工作流)
- [常见任务](#常见任务)

---

## 开发环境设置

### 前置要求

1. **Python 3.10+**
   ```bash
   python3 --version
   ```

2. **Node.js 18+ 和 npm**
   ```bash
   node --version
   npm --version
   ```

3. **Docker 和 Docker Compose**
   ```bash
   docker --version
   docker compose version
   ```

4. **MySQL 8.0+**（或使用 Docker）
5. **Redis 6.0+**（或使用 Docker）
6. **Kafka 2.8+**（或使用 Docker）

### 初始设置

```bash
# 克隆仓库
git clone <repository-url> /home/kali/repo
cd /home/kali/repo

# 复制环境文件
cp .example.env .env

# 编辑 .env 用于开发
nano .env
```

### 开发环境变量

```bash
# 开发设置
MYSQL_HOST=localhost
MYSQL_ROOT_PASSWORD=dev_password
REDIS_HOST=localhost
REDIS_PASSWORD=
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# 启用调试模式
PYTHONUNBUFFERED=1
LOG_LEVEL=DEBUG
```

---

## 项目结构

详细的项目结构请参考 [STRUCTURE.md](STRUCTURE.md) [English](en/STRUCTURE.md)。

### 关键目录

- `server/backend/` - Python FastAPI 后端
- `server/frontend/` - React TypeScript 前端
- `docs/` - 文档
- `Websites/` - 网站证书
- `Apis/` - API 证书

---

## 后端开发

### 设置后端环境

```bash
cd server/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 本地运行后端

```bash
# 从 server/backend 目录
cd inputs/api
python main.py

# 或直接使用 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 后端架构

- **Models** (`models/`)：SQLAlchemy ORM 模型
- **Applications** (`modules/applications/`)：业务逻辑
- **Interfaces** (`modules/interfaces/http/handler/`)：HTTP 处理器
- **Repositories** (`modules/repositories/`)：数据访问
- **Events** (`events/`)：Kafka 事件定义
- **Tasks** (`tasks/`)：定时任务
- **Utils** (`utils/`)：辅助函数

### 添加新的 API 端点

1. **添加处理器方法**（`modules/interfaces/http/handler/tls/tls.py` 或相应的处理器）：
```python
@router.get("/example")
async def example_endpoint(store: CertStore):
    """示例端点"""
    try:
        request = ExampleRequest(store=store.value)
        result = example_operation(
            app=self.certificate_application,
            request=request
        )
        return result
    except Exception as e:
        logger.error(f"❌ 示例操作失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

2. **添加应用逻辑**（`modules/applications/tls/handler/`）：
```python
def example_operation(app: CertificateApplication, request: ExampleRequest):
    # 业务逻辑
    return {"success": True, "data": {...}}
```

3. **添加 DTO**（`modules/interfaces/http/dto/reqdto/` 和 `respdto/`）：
```python
class ExampleRequest(BaseModel):
    store: str
```

路由通过处理器的 `create_router()` 方法自动注册。

### 数据库迁移

数据库架构通过 SQLAlchemy 模型管理。表在首次运行时自动创建，也可以手动创建：

```python
# 从模型创建表
from models.base import Base
from modules.server.resources import get_db_engine

engine = get_db_engine()
Base.metadata.create_all(engine)
```

### 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio

# 运行测试
pytest

# 带覆盖率运行
pytest --cov=modules tests/
```

---

## 前端开发

### 设置前端环境

```bash
cd server/frontend

# 安装依赖
npm install

# 或使用 yarn
yarn install
```

### 本地运行前端

```bash
# 带热重载的开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 前端架构

- **Components** (`src/components/`)：可复用的 UI 组件
- **Pages** (`src/pages/`)：路由页面
- **Stores** (`src/stores/`)：Zustand 状态管理
- **APIs** (`src/apis/`)：API 客户端函数
- **Hooks** (`src/hooks/`)：自定义 React hooks
- **Utils** (`src/utils/`)：辅助函数

### 添加新页面

1. **创建页面组件**（`src/pages/`）：
```typescript
import { useQuery } from '@tanstack/react-query';
import { certApi } from '../apis/cert';

export const NewPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['certs'],
    queryFn: () => certApi.getCerts('websites'),
  });

  if (isLoading) return <div>加载中...</div>;

  return <div>{/* 页面内容 */}</div>;
};
```

2. **添加路由**（`src/main.tsx` 或路由文件）：
```typescript
import { NewPage } from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

### 添加新的 API 客户端

```typescript
// src/apis/cert.ts
import axios from 'axios';

export const certApi = {
  getCerts: async (type: string) => {
    const response = await axios.get(`/vault/tls/check/${type}`);
    return response.data;
  },
};
```

### 状态管理

使用 Zustand：

```typescript
// src/stores/certStore.ts
import { create } from 'zustand';

interface CertState {
  certs: Cert[];
  setCerts: (certs: Cert[]) => void;
}

export const useCertStore = create<CertState>((set) => ({
  certs: [],
  setCerts: (certs) => set({ certs }),
}));
```

### 运行测试

```bash
# 安装测试依赖
npm install --save-dev @testing-library/react @testing-library/jest-dom

# 运行测试
npm test

# 带覆盖率运行
npm test -- --coverage
```

---

## 代码规范和标准

### Python（后端）

- 遵循 **PEP 8** 风格指南
- 使用 **Black** 进行格式化
- 使用 **flake8** 进行代码检查
- 推荐使用类型提示

```bash
# 安装格式化工具
pip install black flake8 mypy

# 格式化代码
black modules/

# 代码检查
flake8 modules/

# 类型检查
mypy modules/
```

### TypeScript（前端）

- 遵循 **ESLint** 规则
- 使用 **Prettier** 进行格式化
- 使用 **TypeScript 严格模式**

```bash
# 格式化代码
npm run lint:code-format

# 代码检查
npm run lint

# 修复问题
npm run lint -- --fix
```

### 代码组织

- 保持函数小而专注
- 使用有意义的名称
- 添加文档字符串/注释
- 遵循单一职责原则

---

## 测试

### 后端测试

```python
# tests/test_cert.py
import pytest
from modules.applications.tls.handler.get_certificate_list import get_certificate_list

@pytest.mark.asyncio
async def test_get_certs():
    # 测试逻辑
    result = await get_certificate_list(...)
    assert result is not None
```

### 前端测试

```typescript
// src/components/__tests__/CertList.test.tsx
import { render, screen } from '@testing-library/react';
import { CertList } from '../CertList';

test('渲染证书列表', () => {
  render(<CertList />);
  const element = screen.getByText(/证书/i);
  expect(element).toBeInTheDocument();
});
```

---

## 调试

### 后端调试

```bash
# 使用调试器运行
python -m pdb inputs/api/main.py

# 使用日志
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 前端调试

- 使用 **React DevTools** 浏览器扩展
- 使用浏览器控制台
- 使用 VS Code 调试器

### Docker 调试

```bash
# 进入容器
docker compose exec backend-api bash

# 查看日志
docker compose logs -f backend-api

# 检查环境
docker compose exec backend-api env
```

---

## Git 工作流

### 分支策略

- `main` - 生产就绪代码
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 错误修复分支

### 提交消息

遵循约定式提交：

```
feat: 添加证书导出功能
fix: 解决数据库连接问题
docs: 更新 API 文档
refactor: 重组后端结构
test: 为证书视图添加单元测试
```

### Pull Request 流程

1. 创建功能分支
2. 进行更改
3. 编写测试
4. 更新文档
5. 创建 pull request
6. 代码审查
7. 合并到 develop/main

---

## 常见任务

### 添加新的证书存储

1. 更新枚举（`enums/certificate_store.py`）
2. 根据需要更新模型（`models/tls_certificate.py`）
3. 更新处理器（`modules/interfaces/http/handler/tls/tls.py`）
4. 更新前端类型
5. 更新 API 文档

### 添加定时任务

```python
# tasks/example_task.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

async def example_task():
    # 任务逻辑
    pass

# 在 scheduler.py 中注册
scheduler.add_job(example_task, 'cron', hour=2, minute=0)
```

### 更新依赖

**后端：**
```bash
cd server/backend
pip install package-name
pip freeze > requirements.txt
```

**前端：**
```bash
cd server/frontend
npm install package-name
# package.json 和 package-lock.json 自动更新
```

### 数据库架构更改

1. 更新模型（`models/tls_certificate.py`）
2. 创建迁移（如果使用 Alembic）
3. 测试迁移
4. 更新文档

---

## 开发技巧

1. **使用热重载**：前端和后端在开发中都支持热重载
2. **使用 TypeScript**：严格类型有助于及早发现错误
3. **编写测试**：测试新功能和错误修复
4. **文档化代码**：添加文档字符串和注释
5. **遵循模式**：保持与现有代码的一致性
6. **使用代码检查工具**：在提交前修复代码检查问题
7. **审查日志**：定期检查日志中的错误

---

## 资源

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Docker 文档](https://docs.docker.com/)
- [项目结构](STRUCTURE.md) [English](en/STRUCTURE.md)
- [API 文档](API.md) [English](en/API.md)

---

## 获取帮助

- 查看现有文档
- 审查代码注释
- 查看 GitHub issues
- 询问团队成员
- 查看类似实现

---

## 👨‍💻 开发者信息

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**相关文档**：
- [English Version](en/DEVELOPMENT.md)
- [项目结构](STRUCTURE.md)
- [API 文档](API.md)

祝编码愉快！🚀
