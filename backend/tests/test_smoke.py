from fastapi.testclient import TestClient

from app.main import app


def test_app_starts_and_responds() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
