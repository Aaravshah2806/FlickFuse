# StreamSync

StreamSync is a social streaming platform built to unify viewing histories across Netflix, Prime Video, and Hotstar, providing AI-powered recommendations and social tracking.

## Core Features

1. **Universal Watch History**: Import viewing histories from multiple streaming platforms.
2. **AI Recommendations**: Get personalized content suggestions based on your taste profile using LLMs.
3. **Social Features**: Connect with friends, view their activities, and control privacy via granular settings.
4. **Content Lists**: Create custom lists of movies and shows to watch later or share.

## Tech Stack

- **Frontend**: React 18, Vite, Zustand, Tailwind CSS, TypeScript.
- **Backend (API)**: Python 3.11, FastAPI, Pydantic, asyncpg for concurrent database access.
- **Data**: PostgreSQL 15, Redis 7 (caching/sessions).
- **Authentication**: JWT-based custom auth with Passlib/Bcrypt.

## Quickstart (Local Development)

The easiest way to run the entire stack is with Docker and Docker Compose.

1. **Clone and setup environment**:

   ```bash
   git clone https://github.com/yourusername/streamsync.git
   cd streamsync
   cp .env.example .env
   # Edit .env with any required API keys (OpenAI, TMDB)
   ```

2. **Start the Database Infrastructure**:

   ```bash
   docker-compose up -d postgres redis
   ```

   _Note: On initial creation, wait a few seconds, then manually run migrations against the Postgres container if testing the Node backend:_

   ```bash
   docker exec -i stream-sync-postgres-1 psql -U user -d postgres -c "CREATE DATABASE streamsync;"
   npm run migrate --prefix backend
   ```

3. **Start the Python Backend**:

   ```bash
   cd python-backend
   python -m venv venv
   source venv/bin/activate # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 3000
   ```

   _The Swagger API documentation will be available at [http://localhost:3000/docs](http://localhost:3000/docs)._

4. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   _The React app will be available at [http://localhost:5173](http://localhost:5173)._

## Running Tests

Both front and backend suites are configured:

```bash
# Frontend (Vitest)
cd frontend && npm test

# Python Backend (Pytest)
cd python-backend && python -m pytest --cov=.
```

## Deployment

StreamSync includes definitions to orchestrate the entire app in a single `docker-compose.yml` for production deployments. Continuous integration via GitHub Actions is pre-configured in `.github/workflows/ci.yml`.
