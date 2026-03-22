import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    mock.table.return_value.select.return_value.execute.return_value.data = []
    return mock


class TestRootEndpoints:
    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "FlickFuse API"
        assert data["status"] == "healthy"

    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_api_info(self, client):
        response = client.get("/api")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "FlickFuse API"
        assert "endpoints" in data
        assert "friends" in data["endpoints"]
        assert "lists" in data["endpoints"]
        assert "recommendations" in data["endpoints"]
        assert "taste_profile" in data["endpoints"]
        assert "streaming" in data["endpoints"]


class TestFriendsEndpoints:
    def test_get_friend_requests_requires_auth(self, client):
        response = client.get("/api/friends/requests")
        assert response.status_code == 422

    def test_send_friend_request_requires_auth(self, client):
        response = client.post("/api/friends/requests", json={"receiver_id": "test-id"})
        assert response.status_code == 422

    @patch("app.routers.friends.get_supabase")
    def test_send_friend_request_to_self(self, mock_get_supabase, client):
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=MagicMock(id="user-123"))
        mock_get_supabase.return_value = mock_supabase

        response = client.post(
            "/api/friends/requests",
            json={"receiver_id": "user-123"},
            headers={"Authorization": "Bearer test-token"}
        )
        assert response.status_code == 400
        assert "yourself" in response.json()["detail"].lower()

    @pytest.mark.skip(reason="Requires proper async mock setup for Supabase client")
    @patch("app.routers.friends.get_supabase")
    def test_send_friend_request_duplicate(self, mock_get_supabase, client):
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=MagicMock(id="user-123"))
        
        mock_table = MagicMock()
        mock_select = MagicMock()
        mock_or_result = MagicMock()
        mock_or_result.execute.return_value.data = [{"id": "existing"}]
        mock_select.or_.return_value = mock_or_result
        mock_table.select.return_value = mock_select
        
        mock_supabase.table.return_value = mock_table
        mock_get_supabase.return_value = mock_supabase

        response = client.post(
            "/api/friends/requests",
            json={"receiver_id": "user-456"},
            headers={"Authorization": "Bearer test-token"}
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    @patch("app.routers.friends.get_supabase")
    def test_search_users_requires_auth(self, mock_get_supabase, client):
        response = client.get("/api/friends/search?query=test")
        assert response.status_code == 422


class TestListsEndpoints:
    def test_get_lists_requires_auth(self, client):
        response = client.get("/api/lists")
        assert response.status_code == 422

    def test_create_list_requires_auth(self, client):
        response = client.post("/api/lists", json={"title": "Test List"})
        assert response.status_code == 422

    def test_create_list_validation(self, client):
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=MagicMock(id="user-123"))
        with patch("app.routers.lists.get_supabase", return_value=mock_supabase):
            response = client.post(
                "/api/lists",
                json={"title": ""},
                headers={"Authorization": "Bearer test-token"}
            )
            assert response.status_code == 422


class TestStreamingEndpoints:
    def test_search_tmdb_requires_query(self, client):
        response = client.get("/api/streaming/search-tmdb")
        assert response.status_code == 422

    @patch.dict(os.environ, {"TMDB_API_KEY": ""})
    def test_search_tmdb_no_api_key(self, client):
        response = client.get("/api/streaming/search-tmdb?query=test")
        assert response.status_code == 500
        assert "not configured" in response.json()["detail"].lower()

    def test_trending_content_type_validation(self, client):
        response = client.get("/api/streaming/trending?content_type=invalid")
        assert response.status_code == 422

    def test_trending_time_window_validation(self, client):
        response = client.get("/api/streaming/trending?time_window=invalid")
        assert response.status_code == 422

    def test_popular_limit_validation(self, client):
        response = client.get("/api/streaming/popular?limit=100")
        assert response.status_code == 422


class TestCORSConfiguration:
    def test_cors_headers(self, client):
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            }
        )
        assert response.status_code == 200
