# Developer Guide

This guide helps developers understand the codebase and make contributions to FlickFuse.

## Architecture Overview

FlickFuse follows a client-server architecture:

```
┌─────────────┐     REST API      ┌─────────────┐
│   Frontend  │ ←───────────────→ │   Backend   │
│   (React)   │                   │  (FastAPI)  │
└─────────────┘                   └─────────────┘
                                          ↓
                                   ┌─────────────┐
                                   │  Supabase   │
                                   │ (Database)  │
                                   └─────────────┘
                                          ↓
                                   ┌─────────────┐
                                   │    TMDB     │
                                   │  (Content)  │
                                   └─────────────┘
```

## Frontend Development

### Tech Stack
- **React 19** with functional components and hooks
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **React Router v7** for client-side routing

### Component Structure

```
frontend/src/
├── components/       # Reusable UI components
│   ├── ui/         # Base UI components (Button, Card, Input, Badge)
│   └── ...
├── pages/          # Page components (one per route)
├── context/        # React context providers (AuthContext)
├── lib/            # Utility functions
│   ├── supabase.ts    # Supabase client
│   ├── tmdb.ts        # TMDB API helpers
│   ├── csvParser.ts    # CSV parsing utilities
│   └── tmdbMatcher.ts  # Content matching
├── types/          # TypeScript type definitions
└── __tests__/     # Test files
```

### Adding a New Page

1. Create the page component in `frontend/src/pages/`:
```tsx
// Example: MyNewPage.tsx
import { useState, useEffect } from 'react';

export default function MyNewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div className="p-4">
      <h1>My New Page</h1>
    </div>
  );
}
```

2. Add the route in `App.tsx`:
```tsx
import MyNewPage from './pages/MyNewPage';

function App() {
  return (
    <Routes>
      <Route path="/new-page" element={<MyNewPage />} />
    </Routes>
  );
}
```

### Adding a New API Endpoint

1. Create a new router file in `backend/app/routers/`:
```python
# backend/app/routers/example.py
from fastapi import APIRouter, Depends, Header
from typing import List, Optional

router = APIRouter(prefix="/api/example", tags=["Example"])

def get_current_user_id(authorization: str = Header(...)) -> str:
    # Auth logic
    pass

@router.get("")
async def get_items(user_id: str = Depends(get_current_user_id)):
    # Endpoint logic
    pass
```

2. Register the router in `backend/app/main.py`:
```python
from app.routers import example_router

app.include_router(example_router)
```

### Working with the Database

#### Supabase Schema Conventions

- **Tables**: snake_case naming
- **Foreign Keys**: `{table}_id` pattern
- **Timestamps**: Include `created_at` and `updated_at` columns
- **UUIDs**: Use Supabase's `gen_random_uuid()` for IDs

#### Example Table Definition

```sql
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;

-- Example policy
CREATE POLICY "Users can manage own lists"
  ON user_lists FOR ALL
  USING (auth.uid() = user_id);
```

### Testing

#### Frontend Tests

Tests use Vitest and React Testing Library.

```bash
# Run tests
npm run test:run

# Run in watch mode
npm run test

# Run with coverage
npm run test:coverage
```

Example test:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

#### Backend Tests

Tests use pytest and FastAPI's TestClient.

```bash
# Run tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

Example test:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
```

### Code Style

#### Frontend
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript types, avoid `any`
- Follow existing naming conventions

#### Backend
- Follow PEP 8
- Use type hints
- Use async/await for I/O operations
- Handle exceptions properly

### Git Workflow

1. Create a feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add my feature"
```

3. Push and create PR:
```bash
git push origin feature/my-feature
```

### Common Tasks

#### Adding a New Environment Variable

1. Add to `.env.example`
2. Add to GitHub Secrets (for CI/CD)
3. Use in code:
   - Frontend: `import.meta.env.VITE_VAR_NAME`
   - Backend: `os.getenv("VAR_NAME")`

#### Adding a New Dependency

**Frontend:**
```bash
npm install package-name
npm install -D package-name  # Dev dependency
```

**Backend:**
```bash
pip install package-name
```

#### Database Migration

Use Supabase dashboard or migrations folder for schema changes.

## Troubleshooting

### Frontend

**Port already in use:**
```bash
# Find and kill process
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

**Type errors:**
```bash
npm run build  # Check for type errors
npx tsc --noEmit  # Type check only
```

### Backend

**Import errors:**
```bash
# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

**Database connection issues:**
Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct.

## Resources

- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Supabase Documentation](https://supabase.com/docs)
- [TMDB API Documentation](https://developer.themoviedb.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
