import pytest
import bcrypt

@pytest.mark.asyncio
async def test_register_success(async_client, mock_pool):
    # Setup mock to return no existing user, then a successful insert
    mock_pool.fetchrow.side_effect = [
        None, # First call: check existing = None
        {     # Second call: insert return value
            "id": "11111111-2222-3333-4444-555555555555",
            "email": "test@test.com",
            "username": "testuser",
            "unique_id": "testuser_abc",
            "display_name": "Test User",
            "created_at": None,
        }
    ]

    response = await async_client.post("/api/auth/register", json={
        "email": "test@test.com",
        "username": "testuser",
        "password": "Password123!"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "test@test.com"
    assert "accessToken" in data
    assert "refreshToken" in data

@pytest.mark.asyncio
async def test_register_conflict(async_client, mock_pool):
    # Setup mock to return an existing user
    mock_pool.fetchrow.side_effect = [{"id": "exists"}]

    response = await async_client.post("/api/auth/register", json={
        "email": "test@test.com",
        "username": "testuser",
        "password": "Password123!"
    })
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_login_success(async_client, mock_pool):
    password = "Password123!"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    mock_pool.fetchrow.return_value = {
        "id": "11111111-2222-3333-4444-555555555555",
        "email": "test@test.com",
        "username": "testuser",
        "unique_id": "testuser_abc",
        "display_name": "Test User",
        "email_verified": True,
        "password_hash": password_hash
    }

    response = await async_client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": password
    })
    
    assert response.status_code == 200
    assert "accessToken" in response.json()

@pytest.mark.asyncio
async def test_get_me_success(async_client, mock_pool, auth_header):
    mock_pool.fetchrow.return_value = {
        "id": "12345678-1234-5678-1234-567812345678",
        "email": "me@test.com",
        "username": "me",
        "unique_id": "me_123",
        "display_name": "Me",
        "profile_picture_url": None,
        "bio": "Hello",
        "privacy_settings": '{"profile": "public"}',
        "email_verified": True,
        "created_at": None
    }
    
    response = await async_client.get("/api/auth/me", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["username"] == "me"
