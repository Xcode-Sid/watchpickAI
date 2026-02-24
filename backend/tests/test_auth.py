def test_picks_generate_requires_auth(client):
    resp = client.post("/api/v1/picks/generate", json={
        "budget": "$500",
        "occasion": "Daily",
        "style": "Classic",
        "wristSize": "Medium",
        "gender": "Men's",
        "brandOpenness": "Any",
    })
    assert resp.status_code == 401
    body = resp.json()
    assert body["success"] is False
    assert "authorization" in body["error"].lower()


def test_user_profile_requires_auth(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401


def test_checkout_requires_auth(client):
    resp = client.post("/api/v1/payments/create-checkout", json={"plan": "pro"})
    assert resp.status_code == 401


def test_portal_requires_auth(client):
    resp = client.post("/api/v1/payments/portal")
    assert resp.status_code == 401


def test_invalid_bearer_token(client):
    resp = client.get("/api/v1/users/me", headers={"Authorization": "Bearer invalid-token-here"})
    assert resp.status_code == 401


def test_picks_history_requires_auth(client):
    resp = client.get("/api/v1/picks/history")
    assert resp.status_code == 401
