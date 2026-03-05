import pytest
import io

@pytest.mark.asyncio
async def test_import_netflix_success(async_client, mock_pool, auth_header):
    csv_content = "Title,Date\nMovie A,01/01/2024\nMovie B,01/02/2024"
    files = {"file": ("Netflix.csv", csv_content, "text/csv")}
    
    # Mock upsert logic: SELECT, then INSERT
    mock_pool.fetchrow.return_value = {"id": "c1"}
    mock_pool.execute.return_value = "INSERT 1"

    response = await async_client.post("/api/import/netflix", headers=auth_header, files=files)
    assert response.status_code == 201
    assert response.json()["stats"]["imported"] == 2

@pytest.mark.asyncio
async def test_import_prime_success(async_client, mock_pool, auth_header):
    csv_content = "Title,Date\nPrime Movie,2024-01-01"
    files = {"file": ("Prime.csv", csv_content, "text/csv")}
    
    mock_pool.fetchrow.return_value = {"id": "c2"}
    mock_pool.execute.return_value = "INSERT 1"

    response = await async_client.post("/api/import/prime", headers=auth_header, files=files)
    assert response.status_code == 201
    assert response.json()["stats"]["imported"] == 1

@pytest.mark.asyncio
async def test_import_hotstar_success(async_client, mock_pool, auth_header):
    csv_content = "Title,Watched On\nHotstar Movie,2024-01-01"
    files = {"file": ("Hotstar.csv", csv_content, "text/csv")}
    
    mock_pool.fetchrow.return_value = {"id": "c3"}
    mock_pool.execute.return_value = "INSERT 1"

    response = await async_client.post("/api/import/hotstar", headers=auth_header, files=files)
    assert response.status_code == 201
    assert response.json()["stats"]["imported"] == 1

@pytest.mark.asyncio
async def test_get_import_status(async_client, mock_pool, auth_header):
    mock_pool.fetchval.side_effect = [10, True]

    response = await async_client.get("/api/import/status", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["totalImported"] == 10
    assert response.json()["hasTasteProfile"] is True
