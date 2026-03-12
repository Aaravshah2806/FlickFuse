# FlickFuse Technical Roadmap

As Phase 7 (Maintenance & Iteration) concludes the initial build, here are the targeted areas for future enhancements, technical debt resolution, and feature additions.

## 1. AI Integration Deepening

- **Current State**: The `/recommendations/generate` endpoint utilizes a mock/heuristic scoring mechanism based on genres.
- **Future State**: Integrate `openai` or `anthropic` Python SDKs. Pass the user's `tasteProfile` and content catalog metadata into an LLM prompt to receive rich, personalized reasoning and dynamic matches.
- **Action Items**:
  - Install `openai` package.
  - Create a new service layer `services/ai.py` to abstract the prompt building.

## 2. Technical Debt & Robustness

- **Database Migrations**: Currently relying on the Node `node-pg-migrate` tool. Migrate schema definitions to Python using `Alembic` and `SQLAlchemy` for native FastAPI alignment.
- [x] **Test Coverage**: The Python backend now has a comprehensive `pytest` suite reproducing the original backend tests with 87% coverage.
- **Type Checking**: Integrate `mypy` natively into the CI pipeline for the backend.

## 3. Advanced Features

- **Real-Time Social Feed**: Integrate WebSockets (`fastapi.websockets`) to stream friend activity (e.g., "Friend just started watching Dark") to the frontend's dashboard.
- **Automated Catalog Sync**: Implement server background tasks (via `Celery` or FastAPI `BackgroundTasks`) to automatically poll the TMDB API and update content metadata mappings on a daily cron schedule.

## 4. Observability & Monitoring

- **Current State**: Basic configurable `logging` output to standard out.
- **Future State**: Connect Promtail/Loki or Datadog for log aggregation. Wire up Prometheus metrics bridging FastAPI request durations.
