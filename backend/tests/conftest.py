import pytest
import os
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def setup_env():
    os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
    os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")
    os.environ.setdefault("TMDB_API_KEY", "test-tmdb-key")


@pytest.fixture
def mock_user():
    return MagicMock(
        id="test-user-123",
        email="test@example.com",
        user=MagicMock(id="test-user-123")
    )


@pytest.fixture
def mock_profile():
    return {
        "id": "test-user-123",
        "username": "testuser",
        "display_name": "Test User",
        "bio": "Test bio",
        "avatar_url": "https://example.com/avatar.jpg",
        "unique_id": "TU123",
        "privacy_setting": "public",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }


@pytest.fixture
def mock_friend_request():
    return {
        "id": "request-123",
        "sender_id": "user-123",
        "receiver_id": "user-456",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }


@pytest.fixture
def mock_list():
    return {
        "id": "list-123",
        "user_id": "test-user-123",
        "title": "My Watchlist",
        "description": "A list of things to watch",
        "visibility": "private",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "item_count": 5
    }
