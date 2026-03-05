import pytest
from uuid import uuid4

@pytest.mark.asyncio
async def test_get_lists_success(async_client, mock_pool, auth_header):
    mock_pool.fetch.return_value = [
        {"id": "l1", "title": "List 1", "description": "Desc", "visibility": "public", "created_at": None, "item_count": 5}
    ]

    response = await async_client.get("/api/lists/", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()["lists"]) == 1

@pytest.mark.asyncio
async def test_create_list_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "l1", "title": "New List", "description": "New", "visibility": "friends", "user_id": "u1"
    }

    response = await async_client.post("/api/lists/", headers=auth_header, json={
        "title": "New List",
        "description": "New",
        "visibility": "friends"
    })
    assert response.status_code == 201
    assert response.json()["list"]["title"] == "New List"

@pytest.mark.asyncio
async def test_update_list_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "l1", "title": "Updated", "description": "Updated", "visibility": "private"
    }

    response = await async_client.put("/api/lists/l1", headers=auth_header, json={
        "title": "Updated"
    })
    assert response.status_code == 200
    assert response.json()["list"]["title"] == "Updated"

@pytest.mark.asyncio
async def test_get_list_items_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "l1", "title": "List 1", "user_id": "12345678-1234-5678-1234-567812345678", "visibility": "public"
    }
    mock_pool.fetch.return_value = [
        {
            "id": "li1", "position": 1, "notes": "note", "added_at": None,
            "catalog_id": str(uuid4()), "title": "Movie 1", "genres": [], "content_type": "movie",
            "platform_availability": [], "poster_path": None, "ratings": {}
        }
    ]

    response = await async_client.get("/api/lists/l1/items", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1

@pytest.mark.asyncio
async def test_add_list_item_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.side_effect = [
        {"id": "l1"}, # list exists
        {"id": "li-new"} # insert return
    ]
    mock_pool.fetchval.return_value = 2

    response = await async_client.post("/api/lists/l1/items", headers=auth_header, json={
        "catalogId": str(uuid4()),
        "notes": "Added via test"
    })
    assert response.status_code == 201
    assert response.json()["success"] is True

@pytest.mark.asyncio
async def test_remove_list_item_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {"id": "l1"}

    response = await async_client.delete("/api/lists/l1/items/li1", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["success"] is True
