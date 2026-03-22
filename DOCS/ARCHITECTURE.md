# Architecture Overview

## High‑Level System Diagram

```
[Client (Web UI)] <---> [Frontend Server (React/Vite)] <---> [Backend API (FastAPI)] <---> [Database (PostgreSQL)]
                               |
                               +---> [External Services]
                                   - TMDB API
                                   - Auth Provider (OAuth)
                                   - Email Service
```

## Components

- **Frontend**: SPA built with Vite + React, uses Tailwind for styling, communicates via REST/GraphQL.
- **Backend**: FastAPI (Python) exposing CRUD endpoints, handles authentication, business logic, and integrates with external APIs.
- **Database**: PostgreSQL for persistent storage, managed via SQLAlchemy ORM.
- **CI/CD**: GitHub Actions run tests, linting, and build Docker images for deployment.
- **Deployment**: Docker Compose for local dev, Kubernetes (or Docker Swarm) for production.

## Data Flow

1. User interacts with the UI.
2. UI sends requests to the Backend API.
3. Backend processes, accesses the DB, calls external services when needed.
4. Responses are returned to the UI for rendering.

## Security

- JWT based authentication.
- HTTPS enforced in production.
- Secrets managed via environment variables / Vault.
