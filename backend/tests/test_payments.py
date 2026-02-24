def test_webhook_rejects_invalid_signature(client):
    resp = client.post(
        "/api/v1/payments/webhook",
        content=b'{"type": "test"}',
        headers={"stripe-signature": "invalid"},
    )
    assert resp.status_code == 400
    assert resp.json()["success"] is False


def test_checkout_invalid_plan(client):
    resp = client.post(
        "/api/v1/payments/create-checkout",
        json={"plan": "invalid_plan"},
    )
    # Should fail with 401 (no auth) or 422 (validation) before reaching Stripe
    assert resp.status_code in (401, 422)
