def test_request_id_header_returned(client):
    resp = client.get("/api/v1/health")
    assert "X-Request-ID" in resp.headers
    assert len(resp.headers["X-Request-ID"]) > 0


def test_custom_request_id_forwarded(client):
    resp = client.get("/api/v1/health", headers={"X-Request-ID": "test-123"})
    assert resp.headers["X-Request-ID"] == "test-123"


def test_security_headers_present(client):
    resp = client.get("/api/v1/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_404_returns_json(client):
    resp = client.get("/api/v1/nonexistent")
    assert resp.status_code == 404
    body = resp.json()
    assert body["success"] is False
