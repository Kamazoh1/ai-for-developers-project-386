"""Seam 1: the HTTP interface of the real backend app.

Tests drive the real app through Starlette's TestClient. Everything that varies
between tests (calendar timezone today; database path and "now" in later
tickets) is passed to ``make_client`` and reaches the app the way it does in
production: through environment variables or app dependencies. Extend the
fixture instead of building clients by hand in test modules.
"""

from collections.abc import Callable, Iterator
from contextlib import ExitStack

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

ClientFactory = Callable[..., TestClient]


@pytest.fixture
def make_client(monkeypatch: pytest.MonkeyPatch) -> Iterator[ClientFactory]:
    """Factory for a started app: ``make_client(calendar_timezone="Asia/Tokyo")``.

    Startup errors propagate, so tests can assert on a refused start. Every
    client created is closed at teardown.
    """
    stack = ExitStack()

    def factory(*, calendar_timezone: str | None = None) -> TestClient:
        monkeypatch.delenv("CALENDAR_TIMEZONE", raising=False)
        if calendar_timezone is not None:
            monkeypatch.setenv("CALENDAR_TIMEZONE", calendar_timezone)
        return stack.enter_context(TestClient(create_app()))

    with stack:
        yield factory


@pytest.fixture
def client(make_client: ClientFactory) -> TestClient:
    """App with default settings."""
    return make_client()
