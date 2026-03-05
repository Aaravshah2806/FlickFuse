import pytest
from datetime import datetime

@pytest.mark.asyncio
async def test_get_watch_history_success(async_client, mock_pool, auth_header):
    mock_pool.fetch.return_value = [
        {
            "id": "we1", "date_watched": datetime.now(), "progress_percent": 100, "platform": "Netflix",
            "catalog_id": "c1", "title": "Movie 1", "content_type": "movie",
            "genres": ["Action"], "poster_path": None
        }
    ]

    response = await async_client.get("/api/watch-events/", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()["watchHistory"]) == 1
    assert response.json()["watchHistory"][0]["title"] == "Movie 1"
