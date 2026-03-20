# NFX-Vault Project Structure

This document provides a detailed explanation of the NFX-Vault project structure.

## 📁 Overall Directory Structure

```
Certs/
├── backend/                         # Backend service (Python FastAPI)
│   ├── models/                      # Data models (SQLAlchemy)
│   │   ├── base.py                  # Base model class
│   │   └── tls_certificate.py       # TLS certificate model
│   ├── enums/                       # Enumeration definitions
│   │   ├── certificate_store.py     # Certificate store enum
│   │   ├── certificate_source.py    # Certificate source enum
│   │   └── certificate_status.py    # Certificate status enum
│   ├── events/                      # Event handlers
│   │   ├── export_certificate_event.py
│   │   └── delete_file_or_folder_event.py
│   ├── inputs/                      # Service entry points
│   │   ├── api/                     # API service entry
│   │   │   └── main.py              # FastAPI HTTP server
│   │   └── pipeline/                # Pipeline service entry
│   │       └── main.py              # Kafka consumer server
│   ├── modules/                     # Functional modules
│   │   ├── applications/            # Application layer (business logic)
│   │   ├── interfaces/              # Interface layer (HTTP, Kafka)
│   │   │   ├── http/                # HTTP handlers
│   │   │   │   ├── handler/         # Request handlers
│   │   │   │   │   ├── tls/         # TLS certificate handlers
│   │   │   │   │   ├── file/        # File operation handlers
│   │   │   │   │   └── analysis/    # Analysis handlers
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   └── router.py        # Router registration
│   │   │   └── kafka/               # Kafka event handlers
│   │   ├── repositories/            # Repository layer (data access)
│   │   │   ├── database/            # Database repositories
│   │   │   ├── cache/               # Cache repositories
│   │   │   └── tls/                 # TLS file repositories
│   │   ├── configs/                 # Configuration
│   │   │   ├── types.py             # Config dataclasses
│   │   │   ├── cert_config.py       # Certificate config loader
│   │   │   └── database_config.py   # Database config loader
│   │   └── server/                  # Server initialization
│   │       ├── wiring.py            # Dependency injection
│   │       └── resources.py         # Resource management
│   ├── resources/                   # Static resources
│   │   └── certbot/                 # Certbot client
│   ├── tasks/                       # Scheduled tasks
│   │   ├── scheduler.py             # Task scheduler setup
│   │   └── update_days_remaining_task.py
│   ├── utils/                       # Utility functions
│   │   └── certificate.py           # Certificate utilities
│   └── requirements.txt             # Python dependencies
├── frontend/                        # Frontend application (React + TypeScript)
│   ├── src/
│   │   ├── apis/                    # API client
│   │   ├── components/              # React components
│   │   ├── hooks/                   # React hooks
│   │   ├── pages/                   # Page components
│   │   ├── stores/                  # State management (Zustand)
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Utility functions
│   │   ├── providers/               # Context providers
│   │   ├── layouts/                 # Layout components
│   │   └── main.tsx                 # Entry file
│   ├── public/                      # Static assets
│   ├── Dockerfile                   # Frontend Docker image
│   ├── nginx.conf                   # Nginx configuration
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.ts               # Vite configuration
├── scripts/                         # Local dev helper scripts (optional)
├── Websites/                        # Website certificate storage
│   ├── acme.json                    # Traefik certificate storage file
│   └── exported/                    # Exported certificate files
├── Apis/                            # API certificate storage
│   ├── acme.json                    # Traefik certificate storage file
│   └── exported/                    # Exported certificate files
├── docs/                            # Project documentation
│   ├── README.md                    # English documentation
│   ├── STRUCTURE.md                 # This file
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── DEVELOPMENT.md               # Development guide
│   └── CONFIGURATION.md             # Configuration guide
├── cmd.sh                           # Command-line certificate management tool
├── docker-compose.yml               # Docker Compose configuration
├── .example.env                     # Environment variable template
├── .env                             # Environment configuration (create from .example.env)
├── .gitignore                       # Git ignore file
└── README.md                        # Main documentation (Chinese)
```

---

## 🔧 Backend Structure

### Backend Architecture

The backend follows a **layered architecture** pattern:

```
backend/
├── models/                          # Data Models (SQLAlchemy ORM)
│   ├── base.py                      # Base model class
│   └── tls_certificate.py           # TLS certificate table model
├── enums/                           # Enumerations
│   ├── certificate_store.py         # Store enum (websites/apis/database)
│   ├── certificate_source.py        # Source enum (auto/manual_apply/manual_add)
│   └── certificate_status.py        # Status enum (success/fail/process)
├── events/                          # Event System
│   ├── export_certificate_event.py   # Export certificate event
│   └── delete_file_or_folder_event.py # Delete file event
├── inputs/                          # Service Entry Points
│   ├── api/                         # HTTP API service
│   │   └── main.py                  # FastAPI application entry
│   └── pipeline/                    # Kafka Consumer service
│       └── main.py                  # Pipeline server entry
├── modules/                         # Functional Modules
│   ├── applications/                # Application Layer (Business Logic)
│   │   ├── tls/                     # TLS certificate application
│   │   ├── file/                    # File operation application
│   │   └── analysis/                # Certificate analysis application
│   ├── interfaces/                   # Interface Layer
│   │   ├── http/                    # HTTP API interface
│   │   │   ├── handler/             # Request handlers
│   │   │   │   ├── tls/             # TLS certificate HTTP handler
│   │   │   │   ├── file/            # File operation HTTP handler
│   │   │   │   └── analysis/        # Analysis HTTP handler
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   └── router.py            # Router registration
│   │   └── kafka/                    # Kafka event interface
│   ├── repositories/                 # Repository Layer (Data Access)
│   │   ├── database/                # Database repositories
│   │   ├── cache/                   # Redis cache repositories
│   │   └── tls/                     # TLS file repositories
│   ├── configs/                     # Configuration
│   │   ├── types.py                 # Config dataclasses
│   │   ├── cert_config.py           # Certificate config loader
│   │   └── database_config.py       # Database config loader
│   └── server/                      # Server initialization
│       ├── wiring.py                # Dependency injection
│       └── resources.py             # Resource management
├── resources/                       # Static resources
│   └── certbot/                     # Certbot client
├── tasks/                           # Scheduled Tasks
│   ├── scheduler.py                 # APScheduler setup
│   └── update_days_remaining_task.py # Daily update task
└── utils/                           # Utilities
    └── certificate.py               # Certificate utility functions
```

### Key Components

#### 1. **Models** (`models/`)
- SQLAlchemy ORM models
- Database table definitions
- Main model: `TLSCertificate` (table: `tls_certificates`)

#### 2. **Applications** (`modules/applications/`)
- Business logic layer
- Certificate processing logic
- File operations
- Certificate analysis

#### 3. **Interfaces** (`modules/interfaces/`)
- HTTP handlers for FastAPI routes
- Request/response handling
- API endpoint definitions
- Kafka event handlers

#### 4. **Events** (`events/`)
- Event-driven architecture
- Kafka event definitions
- Event data models

#### 5. **Tasks** (`tasks/`)
- Scheduled tasks using APScheduler
- Daily certificate status updates (update days_remaining)
- Task scheduler initialization

#### 6. **Modules** (`modules/`)
- **Applications**: Business logic layer
  - TLS certificate management
  - File operations
  - Certificate analysis
- **Interfaces**: API and event interfaces
  - HTTP handlers for FastAPI
  - Kafka event handlers
- **Repositories**: Data access layer
  - Database repositories (MySQL)
  - Cache repositories (Redis)
  - TLS file repositories
- **Configs**: Configuration management
  - Environment variable loading
  - Config dataclasses

---

## 🎨 Frontend Structure

### Frontend Architecture

The frontend uses **React + TypeScript + Vite** with modern patterns:

```
frontend/
├── src/
│   ├── apis/                        # API Client
│   │   └── *.ts                     # Axios API clients
│   ├── components/                  # React Components
│   │   ├── common/                  # Common components
│   │   └── */                       # Feature-specific components
│   ├── hooks/                       # Custom Hooks
│   │   └── *.ts                     # React hooks
│   ├── pages/                       # Page Components
│   │   └── *.tsx                    # Route pages
│   ├── stores/                      # State Management
│   │   └── *.ts                     # Zustand stores
│   ├── types/                       # TypeScript Types
│   │   └── *.ts                     # Type definitions
│   ├── utils/                       # Utilities
│   │   └── *.ts                     # Helper functions
│   ├── providers/                   # Context Providers
│   │   └── *.tsx                    # React context providers
│   ├── layouts/                     # Layouts
│   │   └── *.tsx                    # Layout components
│   └── main.tsx                     # Application entry
├── public/                          # Static Assets
│   └── */                           # Images, fonts, etc.
└── package.json                     # Dependencies
```

### Key Components

#### 1. **APIs** (`src/apis/`)
- Axios-based API clients
- Request/response interceptors
- Type-safe API calls

#### 2. **Components** (`src/components/`)
- Reusable UI components
- Feature-specific components
- Common components (buttons, modals, etc.)

#### 3. **Pages** (`src/pages/`)
- Route-level page components
- Main application views
- Certificate list, detail, export pages

#### 4. **Stores** (`src/stores/`)
- Zustand state management
- Global application state
- Certificate data state

#### 5. **Hooks** (`src/hooks/`)
- Custom React hooks
- Data fetching hooks
- UI interaction hooks

---

## 🐳 Docker Structure

### Docker Services

The project consists of three main Docker services:

1. **backend-api** - HTTP API service
   - FastAPI application (entry: `inputs/api/main.py`)
   - Handles REST API requests
   - Port: 10200
   - Handles HTTP requests and publishes Kafka events

2. **backend-pipeline** - Kafka Consumer service
   - Kafka consumer (entry: `inputs/pipeline/main.py`)
   - Processes asynchronous events (certificate refresh, file operations)
   - No external ports
   - Runs scheduled tasks (APScheduler)

3. **frontend** - Web interface
   - Nginx serving React app
   - Port: 10199
   - Proxies API requests to backend-api

### Docker Networks

- **nfx-vault**: Internal bridge network for service communication
- **nfx-edge**: External network for integration with Traefik

---

## 📂 Certificate Storage Structure

### Websites Directory

```
Websites/
├── acme.json                        # Traefik ACME certificate storage
└── exported/                        # Exported certificates
    └── {domain}/                    # Domain-specific exports
        ├── cert.pem
        ├── key.pem
        └── fullchain.pem
```

### Apis Directory

```
Apis/
├── acme.json                        # Traefik ACME certificate storage
└── exported/                        # Exported certificates
    └── {domain}/                    # Domain-specific exports
        ├── cert.pem
        ├── key.pem
        └── fullchain.pem
```

---

## 🔄 Data Flow

### Certificate Check Flow

```
User Request → Frontend → Backend API → Database Query → Response
```

### Certificate Refresh Flow

```
User Request → Backend API → Kafka Event → Pipeline Service → File System Read → Database Update
```

### Certificate Export Flow

```
User Request → Backend API → Kafka Event → Pipeline Service → File Export → Response
```

### Scheduled Task Flow

```
APScheduler (Pipeline Service) → Update Days Remaining Task → Database Update
```

---

## 📦 Dependencies

### Backend Dependencies

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Redis** - Caching
- **Kafka** - Message queue
- **APScheduler** - Task scheduling
- **Docker** - Container management

### Frontend Dependencies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client

---

## 🔐 Security Considerations

1. **Certificate Files**: Stored with `600` permissions
2. **Environment Variables**: Sensitive data in `.env` (not in git)
3. **Docker Networks**: Isolated network communication
4. **API Authentication**: (Configure as needed)

---

## 📝 Notes

- All paths use absolute paths (`/home/kali/repo`)
- Docker volumes mount the certificate directories
- Services communicate through Docker networks
- Frontend proxies API requests to backend

For more details on specific components, refer to the source code and inline documentation.

---

## 👨‍💻 Developer Information

**Developer**: Lucas Lyu  
**Contact**: lyulucas2003@gmail.com

---

**Related Documentation**:
- [Chinese Version](../STRUCTURE.md)
- [API Documentation](API.md)
- [Configuration Guide](CONFIGURATION.md)

