import pytest
from datetime import datetime

@pytest.mark.asyncio
async def test_get_friends_success(async_client, mock_pool, auth_header):
    # Mock sent and received friendships
    mock_pool.fetch.side_effect = [
        [ # sent
            {
                "id": "f1", "created_at": None, "accepted_at": datetime.now(),
                "friend_id": "u2", "username": "friend1", "unique_id": "F1",
                "display_name": "Friend 1", "profile_picture_url": None,
                "genre_vector": {"action": 5}, "language_preferences": ["en"]
            }
        ],
        [] # received
    ]

    response = await async_client.get("/api/friends/", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()["friends"]) == 1
    assert response.json()["friends"][0]["username"] == "friend1"

@pytest.mark.asyncio
async def test_send_friend_request_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.side_effect = [
        {"id": "u2", "username": "user2", "unique_id": "U2", "display_name": "User 2"}, # target user
        None # no existing friendship
    ]

    response = await async_client.post("/api/friends/request", headers=auth_header, json={"uniqueId": "U2"})
    assert response.status_code == 201
    assert response.json()["message"] == "Friend request sent"

@pytest.mark.asyncio
async def test_get_pending_requests(async_client, mock_pool, auth_header):
    mock_pool.fetch.return_value = [
        {
            "id": "req1", "created_at": datetime.now(),
            "requester_id": "u3", "username": "requester", "unique_id": "REQ",
            "display_name": "Requester", "profile_picture_url": None
        }
    ]

    response = await async_client.get("/api/friends/requests", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()["requests"]) == 1

@pytest.mark.asyncio
async def test_accept_request_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {"id": "f1"}

    response = await async_client.post("/api/friends/f1/accept", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True

@pytest.mark.asyncio
async def test_remove_friend_success(async_client, mock_pool, auth_header):
    response = await async_client.delete("/api/friends/f1", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True

@pytest.mark.asyncio
async def test_get_friend_profile_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.side_effect = [
        {"id": "f1"}, # friendship exists
        { # friend user data
            "id": "u2", "username": "friend1", "unique_id": "F1",
            "display_name": "Friend 1", "profile_picture_url": None, "bio": "Bio",
            "genre_vector": {"action": 5}, "language_preferences": ["en"],
            "viewing_patterns": {}, "recent_favorites": []
        }
    ]
    mock_pool.fetch.return_value = [] # public lists

    response = await async_client.get("/api/friends/u2/profile", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["username"] == "friend1"
