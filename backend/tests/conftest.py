import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture()
def admin_headers():
    """Headers with admin API key for admin endpoints."""
    from app.core.config import settings
    return {"X-Admin-Key": settings.admin_api_key} if settings.admin_api_key else {}
