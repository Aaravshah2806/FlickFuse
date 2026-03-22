# Project Rebuild

## Overview

This repository contains the source code for rebuilding the **HackMatch** (or generic) project from scratch. It follows a phased approach covering planning, environment setup, core architecture, feature development, testing, deployment, documentation, and maintenance.

## Quick Start

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```
2. **Setup development environment**
   - Install Python 3.11+ and Node.js 20+.
   - Create a virtual environment and install backend dependencies:
     ```bash
     python -m venv venv
     source venv/bin/activate  # Windows: venv\Scripts\activate
     pip install -r backend/requirements.txt
     ```
   - Install frontend dependencies:
     ```bash
     cd frontend
     npm install
     ```
3. **Run locally**
   - Start backend:
     ```bash
     uvicorn backend.main:app --reload
     ```
   - Start frontend (Vite dev server):
     ```bash
     npm run dev
     ```
   - Open `http://localhost:5173` in your browser.

## Project Structure

```
├─ backend/          # FastAPI backend
│   ├─ app/          # API routes, models, services
│   └─ requirements.txt
├─ frontend/         # Vite + React UI
│   ├─ src/          # Components, pages, hooks
│   └─ index.html
├─ docs/             # Architecture, PRD, phases, etc.
├─ .github/          # CI/CD workflows
└─ README.md
```

## Development Workflow

- **Branching**: `main` (stable) → feature branches → pull request.
- **Testing**: Run `pytest` for backend and `npm test` for frontend.
- **Linting**: `ruff` for Python, `eslint` for JavaScript/TypeScript.
- **CI**: GitHub Actions lint, test, and build Docker images.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Follow the coding standards (PEP8, Prettier).
4. Submit a pull request with a clear description.

## License

This project is licensed under the MIT License.
