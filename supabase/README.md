# Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings > API

### 2. Run Schema
**Option A: Dashboard**
1. Open Supabase Dashboard > SQL Editor
2. Copy contents of `schema.sql`
3. Paste and Run

**Option B: CLI**
```bash
npx supabase db push
```

### 3. Configure Auth
1. Go to Authentication > Providers
2. Enable Email/Password
3. Add redirect URL: `http://localhost:3000` (for local dev)
4. Enable Google OAuth (optional)
5. Enable Apple OAuth (optional)

### 4. Environment Variables
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Schema Overview

```
┌─────────────┐
│ auth.users  │ (Managed by Supabase)
└──────┬──────┘
       │ triggers
       ▼
┌─────────────┐     ┌──────────────────┐
│  profiles   │◄────│ user_preferences │
└──────┬──────┘     └──────────────────┘
       │
       ├────────────┬───────────────┬──────────────┐
       ▼            ▼               ▼              ▼
┌─────────────┐ ┌──────────┐ ┌─────────────┐ ┌───────┐
│watch_history│ │recommends│ │  friendships│ │ lists │
└─────────────┘ └──────────┘ └──────┬──────┘ └───┬───┘
                                     │             │
                              ┌──────┴──────┐      │
                              │friend_request│     │
                              └─────────────┘      ▼
                                                ┌──────────┐
                                                │list_items│
                                                └──────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  platforms  │     │   genres    │     │   content   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │content_genres│
                                         └──────────────┘
```

## Key Features

### Auto-Create Profile
When a user signs up, a profile is automatically created with a unique ID (e.g., "ABC-12345").

### Auto-Manage Friendships
When a friend request is accepted, the friendship is automatically created.

### Friend Visibility
- Users see their own data
- Friends can see each other's watch history (if not private)
- Public profiles/lists are visible to everyone

### Taste Compatibility
Use the function to calculate compatibility between friends:
```sql
SELECT calculate_taste_compatibility(user_id_1, user_id_2);
```

## Useful Queries

### Get a user's friends
```sql
SELECT p.*, f.created_at as friend_since
FROM friendships f
JOIN profiles p ON p.id = f.friend_id
WHERE f.user_id = auth.uid();
```

### Get watch history with content details
```sql
SELECT wh.*, c.title, c.poster_url, c.release_year, p.name as platform
FROM watch_history wh
LEFT JOIN content c ON c.id = wh.content_id
LEFT JOIN platforms p ON p.id = wh.platform_id
WHERE wh.user_id = auth.uid()
ORDER BY wh.watched_at DESC;
```

### Get public lists from friends
```sql
SELECT l.*, p.display_name, p.unique_id
FROM lists l
JOIN profiles p ON p.id = l.user_id
JOIN friendships f ON (f.friend_id = l.user_id OR f.user_id = l.user_id)
WHERE (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  AND l.visibility = 'public';
```

## Troubleshooting

### RLS Issues
If you get "permission denied", check:
1. RLS is enabled on the table
2. User is authenticated (`auth.uid()` returns a value)
3. Policy allows the operation

### Skip RLS (Development Only)
```sql
SET ROLE postgres;
-- run queries
RESET ROLE;
```

### Check Policies
```sql
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'your_table';
```

## Next Steps

1. Implement Supabase client in frontend
2. Create API endpoints for recommendation generation
3. Set up TMDB API for content metadata
4. Build CSV import functionality
5. Implement batch recommendation job
