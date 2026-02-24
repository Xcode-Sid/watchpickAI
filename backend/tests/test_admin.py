def test_admin_requires_key(client):
    resp = client.get("/api/v1/admin/users")
    # 403 if admin key is set but wrong, 503 if not configured
    assert resp.status_code in (403, 503)


def test_admin_analytics_requires_key(client):
    resp = client.get("/api/v1/admin/analytics")
    assert resp.status_code in (403, 503)


def test_admin_user_detail_requires_key(client):
    resp = client.get("/api/v1/admin/users/some-uuid")
    assert resp.status_code in (403, 503)
