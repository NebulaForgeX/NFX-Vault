# NFX-Vault Development Guide

This document provides instructions for setting up a development environment and contributing to NFX-Vault.

## 📋 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Git Workflow](#git-workflow)
- [Common Tasks](#common-tasks)

---

## Development Environment Setup

### Prerequisites

1. **Python 3.10+**
   ```bash
   python3 --version
   ```

2. **Node.js 18+ and npm**
   ```bash
   node --version
   npm --version
   ```

3. **Docker and Docker Compose**
   ```bash
   docker --version
   docker compose version
   ```

4. **MySQL 8.0+** (or use Docker)
5. **Redis 6.0+** (or use Docker)
6. **Kafka 2.8+** (or use Docker)

### Initial Setup

```bash
# Clone repository
git clone <repository-url> /home/kali/repo
cd /home/kali/repo

# Copy environment file
cp .example.env .env

# Edit .env for development
nano .env
```

### Development Environment Variables

```bash
# Development settings
MYSQL_HOST=localhost
MYSQL_ROOT_PASSWORD=dev_password
REDIS_HOST=localhost
REDIS_PASSWORD=
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Enable debug mode
PYTHONUNBUFFERED=1
LOG_LEVEL=DEBUG
```

---

## Project Structure

See [STRUCTURE.md](STRUCTURE.md) for detailed project structure.

### Key Directories

- `server/backend/` - Python FastAPI backend
- `server/frontend/` - React TypeScript frontend
- `docs/` - Documentation
- `Websites/` - Website certificates
- `Apis/` - API certificates

---

## Backend Development

### Setup Backend Environment

```bash
cd server/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run Backend Locally

```bash
# From server/backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Backend Architecture

- **Models** (`models/`): SQLAlchemy ORM models
- **Applications** (`modules/applications/`): Business logic
- **Interfaces** (`modules/interfaces/http/handler/`): HTTP handlers
- **Repositories** (`modules/repositories/`): Data access
- **Events** (`events/`): Kafka event definitions
- **Tasks** (`tasks/`): Scheduled tasks
- **Utils** (`utils/`): Helper functions

### Adding a New API Endpoint

1. **Add Handler Method** (`modules/interfaces/http/handler/tls/tls.py` or appropriate handler):
```python
@router.get("/example")
async def example_endpoint(store: CertStore):
    """Example endpoint"""
    try:
        request = ExampleRequest(store=store.value)
        result = example_operation(
            app=self.certificate_application,
            request=request
        )
        return result
    except Exception as e:
        logger.error(f"❌ Example operation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

2. **Add Application Logic** (`modules/applications/tls/handler/`):
```python
def example_operation(app: CertificateApplication, request: ExampleRequest):
    # Business logic here
    return {"success": True, "data": {...}}
```

3. **Add DTO** (`modules/interfaces/http/dto/reqdto/` and `respdto/`):
```python
class ExampleRequest(BaseModel):
    store: str
```

Routes are automatically registered through the handler's `create_router()` method.

### Database Migrations

The database schema is managed through SQLAlchemy models. Tables are created automatically on first run or can be created manually:

```python
# Create tables from models
from models.base import Base
from modules.server.resources import get_db_engine

engine = get_db_engine()
Base.metadata.create_all(engine)
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

---

## Frontend Development

### Setup Frontend Environment

```bash
cd server/frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### Run Frontend Locally

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Frontend Architecture

- **Components** (`src/components/`): Reusable UI components
- **Pages** (`src/pages/`): Route pages
- **Stores** (`src/stores/`): Zustand state management
- **APIs** (`src/apis/`): API client functions
- **Hooks** (`src/hooks/`): Custom React hooks
- **Utils** (`src/utils/`): Helper functions

### Adding a New Page

1. **Create Page Component** (`src/pages/`):
```typescript
import { useQuery } from '@tanstack/react-query';
import { certApi } from '../apis/cert';

export const NewPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['certs'],
    queryFn: () => certApi.getCerts('websites'),
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Page content */}</div>;
};
```

2. **Add Route** (`src/main.tsx` or router file):
```typescript
import { NewPage } from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

### Adding a New API Client

```typescript
// src/apis/cert.ts
import axios from 'axios';

export const certApi = {
  getCerts: async (type: string) => {
    const response = await axios.get(`/api/certs/check/${type}`);
    return response.data;
  },
};
```

### State Management

Using Zustand:

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

### Running Tests

```bash
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Code Style and Standards

### Python (Backend)

- Follow **PEP 8** style guide
- Use **Black** for formatting
- Use **flake8** for linting
- Type hints recommended

```bash
# Install formatting tools
pip install black flake8 mypy

# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### TypeScript (Frontend)

- Follow **ESLint** rules
- Use **Prettier** for formatting
- Use **TypeScript strict mode**

```bash
# Format code
npm run lint:code-format

# Lint code
npm run lint

# Fix issues
npm run lint -- --fix
```

### Code Organization

- Keep functions small and focused
- Use meaningful names
- Add docstrings/comments
- Follow single responsibility principle

---

## Testing

### Backend Testing

```python
# tests/test_cert.py
import pytest
from app.views.cert_view import CertView

@pytest.mark.asyncio
async def test_get_certs():
    view = CertView()
    result = await view.get_certs('websites')
    assert result is not None
```

### Frontend Testing

```typescript
// src/components/__tests__/CertList.test.tsx
import { render, screen } from '@testing-library/react';
import { CertList } from '../CertList';

test('renders cert list', () => {
  render(<CertList />);
  const element = screen.getByText(/certificates/i);
  expect(element).toBeInTheDocument();
});
```

---

## Debugging

### Backend Debugging

```bash
# Run with debugger
python -m pdb main.py

# Use logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend Debugging

- Use **React DevTools** browser extension
- Use **Redux DevTools** (if using Redux)
- Use browser console
- Use VS Code debugger

### Docker Debugging

```bash
# Enter container
docker compose exec backend-api bash

# View logs
docker compose logs -f backend-api

# Check environment
docker compose exec backend-api env
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Messages

Follow conventional commits:

```
feat: add certificate export feature
fix: resolve database connection issue
docs: update API documentation
refactor: reorganize backend structure
test: add unit tests for cert view
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Create pull request
6. Code review
7. Merge to develop/main

---

## Common Tasks

### Adding a New Certificate Store

1. Update enum (`enums/certificate_store.py`)
2. Update models if needed (`models/tls_certificate.py`)
3. Update handlers (`modules/interfaces/http/handler/tls/tls.py`)
4. Update frontend types
5. Update API documentation

### Adding a Scheduled Task

```python
# tasks/example_task.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

async def example_task():
    # Task logic
    pass

# Register in main.py
scheduler.add_job(example_task, 'cron', hour=2, minute=0)
```

### Updating Dependencies

**Backend:**
```bash
cd server/backend
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd server/frontend
npm install package-name
# package.json and package-lock.json updated automatically
```

### Database Schema Changes

1. Update model (`app/models/`)
2. Create migration (if using Alembic)
3. Test migration
4. Update documentation

---

## Development Tips

1. **Use Hot Reload**: Both frontend and backend support hot reload in development
2. **Use TypeScript**: Strict typing helps catch errors early
3. **Write Tests**: Test new features and bug fixes
4. **Document Code**: Add docstrings and comments
5. **Follow Patterns**: Maintain consistency with existing code
6. **Use Linters**: Fix linting issues before committing
7. **Review Logs**: Check logs regularly for errors

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Project Structure](STRUCTURE.md)
- [API Documentation](API.md)

---

## Getting Help

- Check existing documentation
- Review code comments
- Check GitHub issues
- Ask team members
- Review similar implementations

Happy coding! 🚀

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

**Related Documentation**:
- [Chinese Version](../DEVELOPMENT.md)
- [Project Structure](STRUCTURE.md)
- [API Documentation](API.md)

