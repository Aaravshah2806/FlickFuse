import pytest
from datetime import datetime

@pytest.mark.asyncio
async def test_get_recommendations_db(async_client, mock_pool, auth_header):
    mock_pool.fetch.return_value = [
        {
            "id": "r1", "match_score": 90, "reason": "Match", "user_feedback": None, "generated_at": datetime.now(),
            "catalog_id": "c1", "title": "Film A", "genres": ["Action"], "languages": ["en"], "content_type": "movie",
            "synopsis": "Cool film", "ratings": {"imdb": 8.0}, "platform_availability": ["Netflix"],
            "poster_path": None, "tmdb_id": "123"
        }
    ]

    response = await async_client.get("/api/recommendations/", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["source"] == "database"
    assert response.json()["recommendations"][0]["title"] == "Film A"

@pytest.mark.asyncio
async def test_get_recommendations_mock(async_client, mock_pool, auth_header):
    mock_pool.fetch.return_value = []

    response = await async_client.get("/api/recommendations/", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["source"] == "mock"
    assert len(response.json()["recommendations"]) > 0

@pytest.mark.asyncio
async def test_generate_recommendations_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {"genre_vector": {"Action": 10}, "user_id": "u1"}
    mock_pool.fetch.return_value = [
        {"id": "c1", "genres": ["Action"], "title": "New Movie"}
    ]
    mock_pool.execute.return_value = "INSERT 1"

    response = await async_client.post("/api/recommendations/generate", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["generated"] == 1

@pytest.mark.asyncio
async def test_submit_feedback_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {"id": "r1"}

    response = await async_client.post("/api/recommendations/r1/feedback", headers=auth_header, json={
        "feedback": "want_to_watch"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
