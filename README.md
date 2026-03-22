# FlickFuse

A modern streaming recommendation platform that helps you discover movies and TV shows based on your watch history, connect with friends, and share recommendations.

![FlickFuse](https://via.placeholder.com/800x400?text=FlickFuse+Logo)

## Features

- **Watch History Import**: Import your viewing history from Netflix, Prime Video, and Hotstar
- **Personalized Recommendations**: Get recommendations based on your taste profile and friends' watching habits
- **Social Features**: Connect with friends, share lists, and see what they're watching
- **Content Discovery**: Browse trending content, search TMDB database, and find where to watch
- **Custom Lists**: Create and manage watchlists with privacy controls

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** + **Zod** for form handling
- **Supabase** for authentication and database

### Backend
- **FastAPI** (Python)
- **Supabase** for database
- **TMDB API** for content data

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)
- Supabase account
- TMDB API key

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/Aaravshah2806/FlickFuse.git
cd FlickFuse
```

2. **Configure frontend**
```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

3. **Configure backend**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
TMDB_API_KEY=your_tmdb_api_key
```

### Running Locally

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Both with Docker:**
```bash
docker-compose up --build
```

## Project Structure

```
FlickFuse/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── schemas.py       # Pydantic models
│   │   └── routers/         # API endpoints
│   │       ├── friends.py
│   │       ├── lists.py
│   │       ├── recommendations.py
│   │       ├── streaming.py
│   │       └── taste_profiles.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── lib/             # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── __tests__/       # Tests
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

## API Documentation

### Friends API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Get all friends |
| GET | `/api/friends/requests` | Get friend requests |
| POST | `/api/friends/requests` | Send friend request |
| POST | `/api/friends/requests/{id}/accept` | Accept request |
| POST | `/api/friends/requests/{id}/reject` | Reject request |
| DELETE | `/api/friends/{id}` | Remove friend |
| GET | `/api/friends/search?q=` | Search users |

### Lists API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lists` | Get user's lists |
| POST | `/api/lists` | Create list |
| GET | `/api/lists/{id}` | Get list details |
| PUT | `/api/lists/{id}` | Update list |
| DELETE | `/api/lists/{id}` | Delete list |
| GET | `/api/lists/{id}/items` | Get list items |
| POST | `/api/lists/{id}/items` | Add item |
| DELETE | `/api/lists/{id}/items/{content_id}` | Remove item |

### Streaming API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streaming/search-tmdb` | Search TMDB |
| GET | `/api/streaming/tmdb/{id}` | Get content details |
| GET | `/api/streaming/trending` | Get trending |
| GET | `/api/streaming/popular` | Get popular |
| GET | `/api/streaming/availability/{id}` | Check availability |

### Recommendations API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get recommendations |
| POST | `/api/recommendations/generate` | Generate recommendations |
| PUT | `/api/recommendations/{id}` | Update status |

### Taste Profile API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/taste-profile` | Get taste profile |
| POST | `/api/taste-profile/generate` | Generate from history |
| GET | `/api/taste-profile/compatibility/{user_id}` | Check compatibility |

## Testing

### Frontend Tests
```bash
cd frontend
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # Coverage report
```

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
# Pull latest changes
git pull origin main

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie and TV data
- [Supabase](https://supabase.com/) for authentication and database
- [Tailwind CSS](https://tailwindcss.com/) for styling
