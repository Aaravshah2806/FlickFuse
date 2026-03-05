import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import os
import sys
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

from main import app

# Tests should use pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

@pytest.fixture
def mock_pool():
    import database
    # A generic mock asyncpg pool
    pool = AsyncMock()
    # By default, mock fetchrow to return a dummy dict or None
    pool.fetchrow.return_value = None
    
    # Inject directly into the module global
    original_pool = database._pool
    database._pool = pool
    
    yield pool
    
    database._pool = original_pool

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

@pytest.fixture
def auth_header():
    from middleware.auth import create_access_token
    token = create_access_token("12345678-1234-5678-1234-567812345678")
    return {"Authorization": f"Bearer {token}"}
