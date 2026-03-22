# FlickFuse API Documentation

## Base URL

```
Development: http://localhost:8000
Production: https://api.streamsync.app
```

## Authentication

Most endpoints require Bearer token authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

## Endpoints

---

## Health Check

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy"
}
```

### GET /api

Get API information.

**Response:**
```json
{
  "name": "FlickFuse API",
  "version": "1.0.0",
  "endpoints": {
    "friends": "/api/friends",
    "lists": "/api/lists",
    "recommendations": "/api/recommendations",
    "taste_profile": "/api/taste-profile",
    "streaming": "/api/streaming"
  }
}
```

---

## Friends API

Base path: `/api/friends`

### GET /api/friends

Get all friends for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "friend_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "friend": {
      "id": "uuid",
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "unique_id": "JD123"
    }
  }
]
```

### GET /api/friends/requests

Get all friend requests (incoming and outgoing).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `accepted`, `rejected`)

### GET /api/friends/requests/incoming

Get incoming friend requests.

**Headers:** `Authorization: Bearer <token>`

### GET /api/friends/requests/outgoing

Get outgoing friend requests.

**Headers:** `Authorization: Bearer <token>`

### POST /api/friends/requests

Send a friend request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "receiver_id": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/friends/requests/{request_id}/accept

Accept a friend request.

**Headers:** `Authorization: Bearer <token>`

### POST /api/friends/requests/{request_id}/reject

Reject a friend request.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/friends/requests/{request_id}

Cancel a friend request (sent by you).

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/friends/{friend_id}

Remove a friend.

**Headers:** `Authorization: Bearer <token>`

### GET /api/friends/search

Search for users.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `query` (required): Search term
- `limit` (optional): Max results (default: 10)

---

## Lists API

Base path: `/api/lists`

### GET /api/lists

Get all lists for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My Favorites",
    "description": "All time favorites",
    "visibility": "private",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "item_count": 12
  }
]
```

### POST /api/lists

Create a new list.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Favorites",
  "description": "All time favorites",
  "visibility": "private"
}
```

### GET /api/lists/{list_id}

Get a specific list.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/lists/{list_id}

Update a list.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "visibility": "public"
}
```

### DELETE /api/lists/{list_id}

Delete a list.

**Headers:** `Authorization: Bearer <token>`

### GET /api/lists/{list_id}/items

Get items in a list.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "list_id": "uuid",
    "content_id": "uuid",
    "position": 0,
    "added_at": "2024-01-01T00:00:00Z",
    "content": {
      "id": "uuid",
      "title": "Movie Title",
      "content_type": "movie",
      "poster_url": "https://..."
    }
  }
]
```

### POST /api/lists/{list_id}/items

Add an item to a list.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content_id": "uuid",
  "position": 0
}
```

### DELETE /api/lists/{list_id}/items/{content_id}

Remove an item from a list.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/lists/{list_id}/reorder

Reorder items in a list.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "item_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Streaming API

Base path: `/api/streaming`

### GET /api/streaming/search-tmdb

Search for content on TMDB.

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 1)
- `content_type` (optional): `movie` or `tv`

**Response:**
```json
{
  "results": [
    {
      "tmdb_id": 123,
      "title": "Movie Title",
      "content_type": "movie",
      "overview": "Description...",
      "poster_path": "https://image.tmdb.org/...",
      "release_date": "2024-01-01",
      "vote_average": 8.5
    }
  ],
  "total_pages": 10,
  "total_results": 200
}
```

### GET /api/streaming/tmdb/{tmdb_id}

Get detailed content information.

**Path Parameters:**
- `tmdb_id`: TMDB content ID

**Query Parameters:**
- `country` (optional): Country code (default: IN)

**Response:**
```json
{
  "content": {
    "id": "uuid",
    "title": "Movie Title",
    "content_type": "movie",
    "description": "Description...",
    "poster_url": "https://...",
    "release_year": 2024,
    "tmdb_id": 123
  },
  "tmdb_id": 123,
  "overview": "Full description...",
  "genres": ["Action", "Adventure"],
  "streaming_platforms": [
    {
      "platform": "netflix",
      "platform_name": "Netflix",
      "logo_url": "https://..."
    }
  ]
}
```

### GET /api/streaming/trending

Get trending content.

**Query Parameters:**
- `content_type` (optional): `all`, `movie`, or `tv` (default: all)
- `time_window` (optional): `day` or `week` (default: week)
- `limit` (optional): Max results 1-50 (default: 20)

### GET /api/streaming/popular

Get popular content.

**Query Parameters:**
- `content_type` (optional): `movie` or `tv` (default: movie)
- `limit` (optional): Max results 1-50 (default: 20)

### GET /api/streaming/availability/{tmdb_id}

Check streaming availability for content.

**Path Parameters:**
- `tmdb_id`: TMDB content ID

**Query Parameters:**
- `country` (optional): Country code (default: IN)

---

## Recommendations API

Base path: `/api/recommendations`

### GET /api/recommendations

Get recommendations for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Max results

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "content_id": "uuid",
    "match_score": 85,
    "reason": "Based on your love for action movies",
    "source": "taste_profile",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "content": {
      "id": "uuid",
      "title": "Movie Title",
      "content_type": "movie",
      "poster_url": "https://..."
    }
  }
]
```

### POST /api/recommendations/generate

Generate new recommendations.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/recommendations/{id}

Update recommendation status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "accepted"
}
```

---

## Taste Profile API

Base path: `/api/taste-profile`

### GET /api/taste-profile

Get the authenticated user's taste profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "genre_scores": {
    "Action": 85,
    "Comedy": 60,
    "Drama": 75
  },
  "content_type_preference": "movie",
  "language_preferences": ["English", "Hindi"],
  "top_genres": ["Action", "Drama", "Sci-Fi"],
  "watch_history_summary": {
    "total_watched": 150,
    "movies_watched": 120,
    "series_watched": 30
  },
  "last_updated": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/taste-profile/generate

Generate taste profile from watch history.

**Headers:** `Authorization: Bearer <token>`

### GET /api/taste-profile/compatibility/{user_id}

Check taste compatibility with another user.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `user_id`: User ID to compare with

**Response:**
```json
{
  "compatibility_score": 85,
  "shared_genres": ["Action", "Drama"],
  "recommendations_from_user": 5
}
```

---

## Enums

### FriendshipStatus
- `pending`
- `accepted`
- `rejected`

### RecommendationStatus
- `pending`
- `accepted`
- `rejected`
- `watched`

### RecommendationSource
- `taste_profile`
- `friends`
- `trending`
- `similar`

### VisibilityLevel
- `public`
- `friends`
- `private`

### ContentType
- `movie`
- `series`

---

## Rate Limiting

Currently, no rate limiting is implemented. Future versions may include rate limiting for public endpoints.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Not authorized for this action |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid request body |
| 500 | Internal Server Error |
