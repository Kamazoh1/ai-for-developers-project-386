"""SQLite storage.

One file database whose path comes from settings. The schema is created at
startup (``Database.create_schema``), idempotently. Connections are short-lived:
open one per unit of work with ``Database.connect()``. They run in autocommit
mode, so a unit of work that needs a transaction opens it explicitly; the
booking flow (``bookings.create_booking``, ADR 0002) uses ``BEGIN IMMEDIATE``.
"""

import sqlite3
from collections.abc import Generator
from contextlib import closing, contextmanager

from fastapi import Request

# How long a writer waits for the database lock before giving up (ADR 0002).
LOCK_TIMEOUT_SECONDS = 30

SCHEMA = """
CREATE TABLE IF NOT EXISTS event_types (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    description      TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id TEXT NOT NULL REFERENCES event_types(id),
    start_utc     TEXT NOT NULL,
    end_utc       TEXT NOT NULL,
    guest_name    TEXT NOT NULL,
    guest_email   TEXT NOT NULL,
    created_at    TEXT NOT NULL
);
"""


class Database:
    def __init__(self, path: str) -> None:
        self.path = path

    @contextmanager
    def connect(self) -> Generator[sqlite3.Connection]:
        """A connection in autocommit mode with rows addressable by column name."""
        with closing(
            sqlite3.connect(self.path, timeout=LOCK_TIMEOUT_SECONDS, isolation_level=None)
        ) as connection:
            connection.row_factory = sqlite3.Row
            yield connection

    def create_schema(self) -> None:
        with self.connect() as connection:
            # WAL lets readers proceed while a booking transaction holds the write lock.
            connection.execute("PRAGMA journal_mode=WAL")
            connection.executescript(SCHEMA)


def get_db(request: Request) -> Database:
    """FastAPI dependency: the app's database (created by ``create_app``)."""
    return request.app.state.db
