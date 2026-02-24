def test_health_returns_ok(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "status" in body["data"]
    assert "services" in body["data"]
    assert "ai_providers" in body["data"]
    assert "ai_fallback_order" in body["data"]


def test_root_redirects_to_docs(client):
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code == 307
    assert resp.headers["location"] == "/docs"


def test_health_has_security_headers(client):
    resp = client.get("/api/v1/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["X-XSS-Protection"] == "1; mode=block"
    assert "X-Request-ID" in resp.headers


def test_backward_compat_health(client):
    """Old /api/health still works."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
