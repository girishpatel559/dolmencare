import os

import pytest
import requests


BASE_URL = os.environ["BASE_URL"].rstrip("/")


@pytest.fixture
def api_client():
    return requests.Session()


def test_valid_quote_lead_returns_response_shape(api_client):
    response = api_client.post(f"{BASE_URL}/api/leads", json={
        "type": "quote", "phone": "+919506636245", "brand": "Samsung", "issue": "Screen Replacement"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "quote"
    assert data["phone"] == "+919506636245"
    assert isinstance(data["id"], str) and data["id"]
    assert "created_at" in data


@pytest.mark.parametrize("payload", [
    {"type": "invalid", "phone": "9506636245"},
    {"type": "quote", "phone": "abc"},
    {"type": "sell", "phone": "123456789012345678"},
])
def test_invalid_leads_are_rejected(api_client, payload):
    response = api_client.post(f"{BASE_URL}/api/leads", json=payload)
    assert response.status_code == 422