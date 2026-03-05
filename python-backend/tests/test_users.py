import pytest
import json

@pytest.mark.asyncio
async def test_get_profile_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "12345678-1234-5678-1234-567812345678",
        "email": "test@test.com",
        "username": "testuser",
        "unique_id": "TEST_ID",
        "display_name": "Test User",
        "profile_picture_url": None,
        "bio": "Bio",
        "privacy_settings": {"profile_visibility": "public"},
        "email_verified": True,
        "created_at": None,
    }

    response = await async_client.get("/api/users/profile", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

@pytest.mark.asyncio
async def test_update_profile_success(async_client, mock_pool, auth_header):
    # Mock check existing username
    # Mock update query
    mock_pool.fetchrow.side_effect = [
        None, # check username existing = None
        {     # update row
            "id": "12345678-1234-5678-1234-567812345678",
            "email": "test@test.com",
            "username": "newusername",
            "unique_id": "TEST_ID",
            "display_name": "New Name",
            "bio": "New Bio",
            "profile_picture_url": None
        }
    ]

    response = await async_client.put("/api/users/profile", headers=auth_header, json={
        "displayName": "New Name",
        "bio": "New Bio",
        "username": "newusername"
    })
    assert response.status_code == 200
    assert response.json()["displayName"] == "New Name"

@pytest.mark.asyncio
async def test_update_privacy_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {"privacy_settings": {"profile_visibility": "public"}}
    mock_pool.execute.return_value = "UPDATE 1"

    response = await async_client.put("/api/users/privacy", headers=auth_header, json={
        "profileVisibility": "private",
        "activityVisibility": False
    })
    assert response.status_code == 200
    assert response.json()["privacySettings"]["profile_visibility"] == "private"
    assert response.json()["privacySettings"]["activity_visibility"] is False

@pytest.mark.asyncio
async def test_get_taste_profile_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "genre_vector": {"action": 5},
        "language_preferences": ["en"],
        "viewing_patterns": {},
        "recent_favorites": [],
        "last_computed_at": None
    }

    response = await async_client.get("/api/users/taste-profile", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["tasteProfile"]["genreVector"]["action"] == 5

@pytest.mark.asyncio
async def test_search_user_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "search-id",
        "username": "searched",
        "unique_id": "SEARCH_123",
        "display_name": "Searched User",
        "profile_picture_url": None,
        "genre_vector": {"drama": 10},
        "language_preferences": ["fr"]
    }

    response = await async_client.get("/api/users/search?uniqueId=SEARCH_123", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["username"] == "searched"
