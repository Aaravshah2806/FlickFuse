# TECHNICAL IMPLEMENTATION GUIDE
## Unified Streaming Taste & Social Recommendation Platform

**Version:** 2.0  
**Date:** February 3, 2026  
**Document Owner:** Engineering Team  

---

## DOCUMENT PURPOSE

This guide provides detailed technical implementation instructions for building the platform. It includes database setup scripts, API endpoint implementations, frontend code examples, deployment configurations, and testing strategies.

---

## TABLE OF CONTENTS

1. Development Environment Setup
2. Database Implementation
3. Backend API Implementation
4. Frontend Implementation
5. Browser Extension Implementation
6. AI Integration
7. Testing Strategy
8. Deployment & DevOps
9. Security Implementation
10. Performance Optimization

---

## 1. DEVELOPMENT ENVIRONMENT SETUP

### 1.1 Prerequisites

**Required Software:**
```bash
# Node.js and npm
node --version  # v20.x or later
npm --version   # v10.x or later

# PostgreSQL
psql --version  # v15.x or later

# Redis
redis-cli --version  # v7.x or later

# Docker (optional but recommended)
docker --version
docker-compose --version
```

### 1.2 Project Structure

```
stream-sync/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── import/
│   │   │   ├── recommendations/
│   │   │   ├── friends/
│   │   │   └── lists/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   ├── taste-profile/
│   │   │   └── catalog/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── extension/
│   ├── src/
│   │   ├── background/
│   │   ├── content/
│   │   ├── popup/
│   │   └── manifest.json
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

### 1.3 Environment Variables

**Backend `.env`:**
```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/streamsync
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_EXPIRY=30d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=streamsync-uploads
AWS_REGION=us-east-1

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@streamsync.com

# Content Catalog
TMDB_API_KEY=your-tmdb-api-key
OMDB_API_KEY=your-omdb-api-key
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=StreamSync
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 1.4 Docker Compose Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: streamsync
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/streamsync
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:3000

volumes:
  postgres_data:
  redis_data:
```

---

## 2. DATABASE IMPLEMENTATION

### 2.1 Complete Schema with Migrations

**Migration: 001_create_users.sql**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- nullable for OAuth users
  username VARCHAR(50) UNIQUE NOT NULL,
  unique_id VARCHAR(10) UNIQUE NOT NULL, -- ABC-12345 format
  display_name VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "public",
    "taste_profile_sharing": "all_friends",
    "activity_visibility": true,
    "recommendation_sharing": true
  }',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_unique_id ON users(unique_id);

-- Function to generate unique ID
CREATE OR REPLACE FUNCTION generate_unique_id() RETURNS VARCHAR(10) AS $$
DECLARE
  new_id VARCHAR(10);
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 3 random uppercase letters
    new_id := chr(65 + floor(random() * 26)::int) ||
              chr(65 + floor(random() * 26)::int) ||
              chr(65 + floor(random() * 26)::int) ||
              '-' ||
              lpad(floor(random() * 100000)::text, 5, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE unique_id = new_id) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate unique_id
CREATE OR REPLACE FUNCTION set_unique_id() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_unique_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_unique_id
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_unique_id();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Migration: 002_create_watch_events.sql**
```sql
CREATE TABLE watch_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('netflix', 'prime_video', 'hotstar', 'apple_tv', 'hbo_max', 'hulu')),
  title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  content_type VARCHAR(20) CHECK (content_type IN ('movie', 'series', 'episode', 'short')),
  date_watched TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  metadata_json JSONB,
  catalog_id UUID, -- Will reference content_catalog once created
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_watch_events_user_id ON watch_events(user_id);
CREATE INDEX idx_watch_events_platform ON watch_events(platform);
CREATE INDEX idx_watch_events_date ON watch_events(date_watched DESC);
CREATE INDEX idx_watch_events_normalized_title ON watch_events USING btree(normalized_title);

-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_watch_events_unique 
ON watch_events(user_id, platform, normalized_title, date_watched);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_watch_events_updated_at
BEFORE UPDATE ON watch_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Function to normalize titles
CREATE OR REPLACE FUNCTION normalize_title(title TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-normalize title
CREATE OR REPLACE FUNCTION set_normalized_title() RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_title := normalize_title(NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_normalized_title
BEFORE INSERT OR UPDATE ON watch_events
FOR EACH ROW
EXECUTE FUNCTION set_normalized_title();
```

**Migration: 003_create_content_catalog.sql**
```sql
-- Enable vector extension for embeddings (if using pgvector)
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  release_year INTEGER,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('movie', 'series', 'episode', 'short')),
  genres TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  synopsis TEXT,
  ratings JSONB, -- {"imdb": 8.5, "rotten_tomatoes": 95, "tmdb": 8.3}
  platform_availability TEXT[] DEFAULT '{}', -- ["netflix", "prime_video"]
  metadata_json JSONB, -- Additional platform-specific data
  tmdb_id INTEGER,
  imdb_id VARCHAR(20),
  -- embedding VECTOR(1536), -- For semantic search (uncomment if using pgvector)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_catalog_title ON content_catalog USING btree(title);
CREATE INDEX idx_catalog_genres ON content_catalog USING GIN(genres);
CREATE INDEX idx_catalog_languages ON content_catalog USING GIN(languages);
CREATE INDEX idx_catalog_platforms ON content_catalog USING GIN(platform_availability);
CREATE INDEX idx_catalog_tmdb_id ON content_catalog(tmdb_id);

-- Add foreign key to watch_events
ALTER TABLE watch_events
ADD CONSTRAINT fk_watch_events_catalog
FOREIGN KEY (catalog_id) REFERENCES content_catalog(id);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_catalog_updated_at
BEFORE UPDATE ON content_catalog
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Migration: 004_create_taste_profiles.sql**
```sql
CREATE TABLE taste_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  genre_vector JSONB NOT NULL DEFAULT '{}', -- {"drama": 0.45, "thriller": 0.32}
  language_preferences JSONB NOT NULL DEFAULT '{}', -- {"english": 0.60, "hindi": 0.25}
  viewing_patterns JSONB NOT NULL DEFAULT '{}', -- behavioral insights
  recent_favorites JSONB NOT NULL DEFAULT '[]', -- [{title, catalog_id}]
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_taste_profiles_user_id ON taste_profiles(user_id);
CREATE INDEX idx_taste_profiles_computed_at ON taste_profiles(last_computed_at DESC);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_taste_profiles_updated_at
BEFORE UPDATE ON taste_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Migration: 005_create_recommendations.sql**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_id UUID NOT NULL REFERENCES content_catalog(id),
  match_score INTEGER NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  reason TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_feedback VARCHAR(20) CHECK (user_feedback IN ('watched', 'want_to_watch', 'not_interested')),
  feedback_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_generated_at ON recommendations(generated_at DESC);
CREATE INDEX idx_recommendations_feedback ON recommendations(user_feedback);

-- Unique constraint: one recommendation per user per catalog item per generation batch
CREATE UNIQUE INDEX idx_recommendations_unique 
ON recommendations(user_id, catalog_id, generated_at);
```

**Migration: 006_create_friendships.sql**
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Indexes
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Unique constraint: prevent duplicate friendship records
CREATE UNIQUE INDEX idx_friendships_unique ON friendships(user_id, friend_id);
```

**Migration: 007_create_lists.sql**
```sql
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'friends' 
    CHECK (visibility IN ('public', 'friends', 'private')),
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  catalog_id UUID NOT NULL REFERENCES content_catalog(id),
  position INTEGER NOT NULL,
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lists_user_id ON user_lists(user_id);
CREATE INDEX idx_lists_visibility ON user_lists(visibility);
CREATE INDEX idx_list_items_list_id ON user_list_items(list_id);
CREATE INDEX idx_list_items_position ON user_list_items(list_id, position);

-- Unique constraint: no duplicate items in same list
CREATE UNIQUE INDEX idx_list_items_unique ON user_list_items(list_id, catalog_id);

-- Triggers
CREATE TRIGGER trigger_update_lists_updated_at
BEFORE UPDATE ON user_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Migration: 008_create_social_feed.sql**
```sql
CREATE TABLE social_feed_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'friends' 
    CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feed_user_id ON social_feed_events(user_id);
CREATE INDEX idx_feed_created_at ON social_feed_events(created_at DESC);
CREATE INDEX idx_feed_event_type ON social_feed_events(event_type);
CREATE INDEX idx_feed_visibility ON social_feed_events(visibility);
```

### 2.2 Seed Data Script

**seeds/01_sample_content.sql:**
```sql
-- Insert sample content catalog
INSERT INTO content_catalog (title, release_year, content_type, genres, languages, synopsis, ratings, platform_availability, tmdb_id) VALUES
('Breaking Bad', 2008, 'series', ARRAY['drama', 'thriller', 'crime'], ARRAY['english'], 
 'A chemistry teacher diagnosed with cancer turns to cooking meth.', 
 '{"imdb": 9.5, "rotten_tomatoes": 96, "tmdb": 9.3}', 
 ARRAY['netflix'], 1396),

('Dark', 2017, 'series', ARRAY['thriller', 'sci-fi', 'mystery'], ARRAY['german'], 
 'A family saga with a supernatural twist, set in a German town.', 
 '{"imdb": 8.7, "rotten_tomatoes": 93, "tmdb": 8.4}', 
 ARRAY['netflix'], 70523),

('The Crown', 2016, 'series', ARRAY['drama', 'historical', 'biography'], ARRAY['english'], 
 'Follows the political rivalries and romance of Queen Elizabeth II.', 
 '{"imdb": 8.6, "rotten_tomatoes": 89, "tmdb": 8.2}', 
 ARRAY['netflix'], 1399),

('Money Heist', 2017, 'series', ARRAY['thriller', 'drama', 'crime'], ARRAY['spanish'], 
 'An criminal mastermind plans the biggest heist in history.', 
 '{"imdb": 8.2, "rotten_tomatoes": 90, "tmdb": 8.3}', 
 ARRAY['netflix'], 71446),

('The Marvelous Mrs. Maisel', 2017, 'series', ARRAY['comedy', 'drama'], ARRAY['english'], 
 'A housewife in the 1950s decides to become a stand-up comic.', 
 '{"imdb": 8.7, "rotten_tomatoes": 90, "tmdb": 8.1}', 
 ARRAY['prime_video'], 70796);

-- Add more sample data as needed
```

---

## 3. BACKEND API IMPLEMENTATION

### 3.1 Project Setup (Node.js + TypeScript + Express)

**package.json:**
```json
{
  "name": "streamsync-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "migrate": "node-pg-migrate up",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "multer": "^1.4.5-lts.1",
    "csv-parser": "^3.0.0",
    "axios": "^1.6.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "@aws-sdk/client-s3": "^3.478.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "node-pg-migrate": "^6.2.2"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.2 Database Connection

**src/database/connection.ts:**
```typescript
import { Pool } from 'pg';
import { createClient } from 'redis';

// PostgreSQL Pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Redis Client
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function connectDatabases() {
  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('✓ PostgreSQL connected');
    client.release();

    // Connect Redis
    await redisClient.connect();
    console.log('✓ Redis connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export async function closeDatabases() {
  await pool.end();
  await redisClient.quit();
}
```

### 3.3 Authentication System

**src/api/auth/auth.controller.ts:**
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../../database/connection';
import { sendVerificationEmail } from '../../services/email';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

export async function register(req: Request, res: Response) {
  try {
    // Validate input
    const { email, password, username } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user (unique_id is auto-generated by trigger)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, unique_id, created_at`,
      [email, passwordHash, username]
    );

    const user = result.rows[0];

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        uniqueId: user.unique_id,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      `SELECT id, email, username, unique_id, password_hash, email_verified 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        uniqueId: user.unique_id,
        emailVerified: user.email_verified,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**src/middleware/auth.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### 3.4 Data Import Implementation

**src/api/import/netflix.controller.ts:**
```typescript
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { pool } from '../../database/connection';

interface NetflixRow {
  Title: string;
  Date: string;
}

export async function importNetflix(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.userId!;
    const results: NetflixRow[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data: NetflixRow) => results.push(data))
      .on('end', async () => {
        try {
          const stats = {
            totalRows: results.length,
            validRows: 0,
            invalidRows: 0,
            duplicates: 0,
            imported: 0,
          };

          // Process each row
          for (let i = 0; i < results.length; i++) {
            const row = results[i];

            try {
              // Validate required fields
              if (!row.Title || !row.Date) {
                errors.push({ row: i + 1, error: 'Missing title or date' });
                stats.invalidRows++;
                continue;
              }

              // Parse date
              const dateWatched = new Date(row.Date);
              if (isNaN(dateWatched.getTime())) {
                errors.push({ row: i + 1, error: 'Invalid date format' });
                stats.invalidRows++;
                continue;
              }

              // Insert watch event
              const result = await pool.query(
                `INSERT INTO watch_events (user_id, platform, title, date_watched)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, platform, normalized_title, date_watched) 
                 DO NOTHING
                 RETURNING id`,
                [userId, 'netflix', row.Title, dateWatched]
              );

              if (result.rowCount === 0) {
                stats.duplicates++;
              } else {
                stats.imported++;
              }

              stats.validRows++;

            } catch (error) {
              console.error('Error processing row:', error);
              errors.push({ row: i + 1, error: 'Database error' });
              stats.invalidRows++;
            }
          }

          // Trigger taste profile recalculation (async job)
          await triggerTasteProfileUpdate(userId);

          res.json({
            success: true,
            stats,
            errors: errors.slice(0, 10), // Return only first 10 errors
          });

        } catch (error) {
          console.error('Import processing error:', error);
          res.status(500).json({ error: 'Error processing import' });
        }
      })
      .on('error', (error: Error) => {
        console.error('CSV parsing error:', error);
        res.status(400).json({ error: 'Invalid CSV format' });
      });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function triggerTasteProfileUpdate(userId: string) {
  // This would typically be a job queue (Bull, BullMQ, etc.)
  // For now, we'll just call it directly
  setTimeout(() => {
    computeTasteProfile(userId).catch(console.error);
  }, 1000);
}

async function computeTasteProfile(userId: string) {
  // Implementation in section 3.6
  console.log(`Computing taste profile for user ${userId}`);
}
```

### 3.5 Taste Profile Computation

**src/services/taste-profile/compute.ts:**
```typescript
import { pool } from '../../database/connection';

interface GenreVector {
  [genre: string]: number;
}

interface LanguagePreferences {
  [language: string]: number;
}

export async function computeTasteProfile(userId: string) {
  try {
    // Fetch user's watch events with catalog links
    const watchEvents = await pool.query(
      `SELECT we.*, cc.genres, cc.languages, we.date_watched
       FROM watch_events we
       LEFT JOIN content_catalog cc ON we.catalog_id = cc.id
       WHERE we.user_id = $1
       ORDER BY we.date_watched DESC`,
      [userId]
    );

    if (watchEvents.rows.length === 0) {
      console.log(`No watch events for user ${userId}`);
      return;
    }

    // Calculate genre vector
    const genreVector = calculateGenreVector(watchEvents.rows);

    // Calculate language preferences
    const languagePreferences = calculateLanguagePreferences(watchEvents.rows);

    // Calculate viewing patterns
    const viewingPatterns = calculateViewingPatterns(watchEvents.rows);

    // Get recent favorites
    const recentFavorites = watchEvents.rows.slice(0, 10).map(row => ({
      title: row.title,
      catalog_id: row.catalog_id,
    }));

    // Upsert taste profile
    await pool.query(
      `INSERT INTO taste_profiles (user_id, genre_vector, language_preferences, viewing_patterns, recent_favorites, last_computed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         genre_vector = $2,
         language_preferences = $3,
         viewing_patterns = $4,
         recent_favorites = $5,
         last_computed_at = NOW(),
         updated_at = NOW()`,
      [
        userId,
        JSON.stringify(genreVector),
        JSON.stringify(languagePreferences),
        JSON.stringify(viewingPatterns),
        JSON.stringify(recentFavorites),
      ]
    );

    console.log(`✓ Taste profile computed for user ${userId}`);

  } catch (error) {
    console.error('Error computing taste profile:', error);
    throw error;
  }
}

function calculateGenreVector(rows: any[]): GenreVector {
  const genreCounts: { [genre: string]: number } = {};
  let totalWeight = 0;

  rows.forEach(row => {
    if (!row.genres) return;

    // Calculate recency weight (exponential decay over 90 days)
    const daysAgo = (Date.now() - new Date(row.date_watched).getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.exp(-daysAgo / 90);

    row.genres.forEach((genre: string) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + weight;
      totalWeight += weight;
    });
  });

  // Normalize to 0-1 scale
  const normalized: GenreVector = {};
  Object.entries(genreCounts).forEach(([genre, count]) => {
    normalized[genre] = count / totalWeight;
  });

  // Sort by value and keep top 10
  return Object.fromEntries(
    Object.entries(normalized)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  );
}

function calculateLanguagePreferences(rows: any[]): LanguagePreferences {
  const languageCounts: { [lang: string]: number } = {};

  rows.forEach(row => {
    if (!row.languages) return;
    row.languages.forEach((lang: string) => {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
  });

  const total = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const normalized: LanguagePreferences = {};

  Object.entries(languageCounts).forEach(([lang, count]) => {
    normalized[lang] = count / total;
  });

  // Return top 5
  return Object.fromEntries(
    Object.entries(normalized)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  );
}

function calculateViewingPatterns(rows: any[]): any {
  const hours = rows.map(row => new Date(row.date_watched).getHours());

  // Determine preferred time of day
  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  hours.forEach(hour => {
    if (hour >= 6 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
    else if (hour >= 18 && hour < 22) timeSlots.evening++;
    else timeSlots.night++;
  });

  const preferredTime = Object.entries(timeSlots)
    .sort(([, a], [, b]) => b - a)[0][0];

  // Calculate movie vs series ratio
  const movieCount = rows.filter(r => r.content_type === 'movie').length;
  const seriesCount = rows.filter(r => r.content_type === 'series' || r.content_type === 'episode').length;
  const movieVsSeriesRatio = seriesCount / (movieCount + seriesCount);

  return {
    preferred_time_of_day: preferredTime,
    movie_vs_series_ratio: movieVsSeriesRatio,
    total_titles_watched: rows.length,
  };
}
```

### 3.6 AI Recommendation Generation

**src/services/ai/recommendations.ts:**
```typescript
import axios from 'axios';
import { pool } from '../../database/connection';

interface TasteProfile {
  genre_vector: { [genre: string]: number };
  language_preferences: { [lang: string]: number };
  viewing_patterns: any;
  recent_favorites: Array<{ title: string; catalog_id: string }>;
}

export async function generateRecommendations(userId: string) {
  try {
    // Fetch user's taste profile
    const profileResult = await pool.query(
      'SELECT * FROM taste_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0) {
      throw new Error('No taste profile found');
    }

    const tasteProfile: TasteProfile = profileResult.rows[0];

    // Fetch content catalog (sample for prompt)
    const catalogResult = await pool.query(
      `SELECT id, title, genres, languages, content_type, synopsis, ratings
       FROM content_catalog
       ORDER BY RANDOM()
       LIMIT 100`
    );

    // Build AI prompt
    const prompt = buildRecommendationPrompt(tasteProfile, catalogResult.rows);

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content recommendation system. Provide recommendations as valid JSON array only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recommendationsText = response.data.choices[0].message.content;
    const recommendations = JSON.parse(recommendationsText);

    // Store recommendations in database
    for (const rec of recommendations) {
      await pool.query(
        `INSERT INTO recommendations (user_id, catalog_id, match_score, reason, generated_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, rec.catalog_id, rec.match_score, rec.reason]
      );
    }

    console.log(`✓ Generated ${recommendations.length} recommendations for user ${userId}`);
    return recommendations;

  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

function buildRecommendationPrompt(profile: TasteProfile, catalog: any[]): string {
  const topGenres = Object.entries(profile.genre_vector)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre, score]) => `${genre} (${Math.round(score * 100)}%)`)
    .join(', ');

  const topLanguages = Object.entries(profile.language_preferences)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, score]) => `${lang} (${Math.round(score * 100)}%)`)
    .join(', ');

  const recentFavorites = profile.recent_favorites
    .slice(0, 5)
    .map(f => f.title)
    .join(', ');

  const catalogSummary = catalog.map(item => ({
    id: item.id,
    title: item.title,
    genres: item.genres,
    language: item.languages[0],
    type: item.content_type,
  }));

  return `
You are a content recommendation expert. Based on the user's taste profile, recommend 10 titles from the provided catalog.

USER PROFILE:
- Top Genres: ${topGenres}
- Languages: ${topLanguages}
- Recent Favorites: ${recentFavorites}
- Viewing Pattern: ${profile.viewing_patterns.preferred_time_of_day} watcher, prefers ${profile.viewing_patterns.movie_vs_series_ratio > 0.5 ? 'series' : 'movies'}

AVAILABLE CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

INSTRUCTIONS:
Provide exactly 10 recommendations as a JSON array with this format:
[{
  "catalog_id": "uuid-here",
  "title": "Title Name",
  "match_score": 85,
  "reason": "Brief explanation matching user preferences"
}]

Focus on diversity while respecting preferences. Match scores should range 70-95. Provide ONLY the JSON array, no additional text.
  `.trim();
}
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 React + TypeScript + Vite Setup

**package.json:**
```json
{
  "name": "streamsync-frontend",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@tanstack/react-query": "^5.14.2",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "tailwindcss": "^3.3.6",
    "lucide-react": "^0.294.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.7",
    "vitest": "^1.0.4",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

**src/services/api.ts:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axios(error.config);
        } catch {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**src/pages/Import/NetflixImport.tsx:**
```typescript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface ImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  imported: number;
}

export function NetflixImport() {
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/import/netflix', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStats(response.data.stats);
      toast.success(`Successfully imported ${response.data.stats.imported} titles!`);

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Failed to import file');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Import Netflix Watch History</h1>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Export Your Data from Netflix</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Go to Netflix.com and log in to your account</li>
          <li>Click your profile icon → Account</li>
          <li>Scroll down to "Viewing Activity"</li>
          <li>Click "Download All" at the bottom of the page</li>
          <li>Save the CSV file to your computer</li>
        </ol>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 2: Upload Your File</h2>
        
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {uploading ? (
            <p className="text-lg text-gray-600">Uploading and processing...</p>
          ) : isDragActive ? (
            <p className="text-lg text-blue-600">Drop the file here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-700 mb-2">
                Drag and drop your Netflix CSV here, or click to select
              </p>
              <p className="text-sm text-gray-500">Accepted format: .csv (max 50MB)</p>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">Import Complete!</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{stats.imported}</div>
              <div className="text-sm text-gray-600">Imported</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">{stats.duplicates}</div>
              <div className="text-sm text-gray-600">Duplicates</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-600">{stats.invalidRows}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              Your taste profile is being generated and you'll receive personalized recommendations within 24 hours.
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.href = '/import'}
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Import Another Platform
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. BROWSER EXTENSION IMPLEMENTATION

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "StreamSync",
  "version": "1.0.0",
  "description": "Import your streaming watch history to StreamSync",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://www.netflix.com/*",
    "https://www.primevideo.com/*",
    "https://www.hotstar.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://www.netflix.com/viewingactivity*"],
      "js": ["content/netflix.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

**content/netflix.js:**
```javascript
// Netflix watch history extraction

function extractNetflixHistory() {
  const items = [];
  const rows = document.querySelectorAll('.retableRow');

  rows.forEach((row) => {
    const titleElement = row.querySelector('.title a');
    const dateElement = row.querySelector('.date');

    if (titleElement && dateElement) {
      items.push({
        title: titleElement.textContent.trim(),
        date: dateElement.textContent.trim(),
      });
    }
  });

  return items;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractHistory') {
    const history = extractNetflixHistory();
    sendResponse({ success: true, count: history.length, data: history });
  }
});

console.log('StreamSync: Netflix content script loaded');
```

**popup/popup.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 400px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    h1 {
      font-size: 18px;
      margin: 0 0 16px 0;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    button:hover {
      background: #1e40af;
    }
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    #status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }
    .success {
      background: #d1fae5;
      color: #065f46;
    }
    .error {
      background: #fee2e2;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <h1>StreamSync</h1>
  <div id="user-info"></div>
  <button id="extract-btn">Extract Watch History</button>
  <div id="status"></div>

  <script src="popup.js"></script>
</body>
</html>
```

**popup/popup.js:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const extractBtn = document.getElementById('extract-btn');
  const statusDiv = document.getElementById('status');

  // Check if user is logged in
  const { accessToken } = await chrome.storage.local.get(['accessToken']);
  
  if (!accessToken) {
    statusDiv.innerHTML = '<a href="https://streamsync.com/login">Please log in first</a>';
    extractBtn.disabled = true;
    return;
  }

  extractBtn.addEventListener('click', async () => {
    extractBtn.disabled = true;
    statusDiv.textContent = 'Extracting watch history...';

    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractHistory' });

      if (response.success) {
        statusDiv.textContent = `Found ${response.count} titles. Syncing...`;

        // Send to backend
        const syncResponse = await fetch('https://api.streamsync.com/api/extension/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            platform: 'netflix',
            data: response.data,
          }),
        });

        if (syncResponse.ok) {
          const result = await syncResponse.json();
          statusDiv.className = 'success';
          statusDiv.textContent = `✓ Synced ${result.stats.imported} titles successfully!`;
        } else {
          throw new Error('Sync failed');
        }
      }
    } catch (error) {
      statusDiv.className = 'error';
      statusDiv.textContent = `Error: ${error.message}`;
    } finally {
      extractBtn.disabled = false;
    }
  });
});
```

---

## 6. TESTING STRATEGY

### 6.1 Backend API Tests

**tests/api/auth.test.ts:**
```typescript
import request from 'supertest';
import app from '../src/app';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toHaveProperty('uniqueId');
  });

  it('should reject duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser1',
      });

    // Duplicate attempt
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        username: 'testuser2',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
```

---

**This implementation guide provides comprehensive code examples and continues with deployment, security, and optimization sections. The complete document would be approximately 150+ pages with all code samples, configurations, and detailed explanations.**

---

**END OF TECHNICAL IMPLEMENTATION GUIDE (EXCERPT)**

*For a complete implementation guide with all code examples, deployment scripts, security hardening, performance optimization, and production configuration, please refer to the full technical documentation.*
