"""Seam 1: the HTTP interface of the real backend app.

Tests drive the real app through Starlette's TestClient. Everything that varies
between tests (calendar timezone, database path and "now") is passed to
``make_client`` and reaches the app the way it does in production: through
environment variables or app dependencies. Extend the fixture instead of
building clients by hand in test modules.

Every client gets its own temporary SQLite *file* (never in-memory: connections
must share one database). Pass ``database_path`` to reopen an existing file.
Pass ``now`` (a timezone-aware datetime) to fix the clock; "now" is an app
dependency, not a patched global.
"""

from collections.abc import Callable, Iterator
from contextlib import ExitStack
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

ClientFactory = Callable[..., TestClient]


@pytest.fixture
def make_client(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Iterator[ClientFactory]:
    """Factory for a started app: ``make_client(calendar_timezone="Asia/Tokyo")``.

    Startup errors propagate, so tests can assert on a refused start. Every
    client created is closed at teardown.
    """
    stack = ExitStack()
    created = 0

    def factory(
        *,
        calendar_timezone: str | None = None,
        database_path: Path | None = None,
        now: datetime | None = None,
    ) -> TestClient:
        nonlocal created
        created += 1
        monkeypatch.delenv("CALENDAR_TIMEZONE", raising=False)
        if calendar_timezone is not None:
            monkeypatch.setenv("CALENDAR_TIMEZONE", calendar_timezone)
        path = database_path or tmp_path / f"calendar-{created}.db"
        monkeypatch.setenv("DATABASE_PATH", str(path))
        clock = None if now is None else (lambda: now)
        return stack.enter_context(TestClient(create_app(now=clock)))

    with stack:
        yield factory


@pytest.fixture
def client(make_client: ClientFactory) -> TestClient:
    """App with default settings and an empty database."""
    return make_client()
