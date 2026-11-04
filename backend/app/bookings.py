"""Booking a slot (ADR 0002).

Checks run in a fixed order: request validation (``422 validation_error``, done by the
framework), then everything that does not depend on bookings (``422 invalid_slot``), then,
inside one write-locked transaction, the overlap check and the insert (``409 slot_taken``).
"""

import sqlite3
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import AwareDatetime, StringConstraints

from app.clock import CalendarTimezone, Now
from app.db import Database, get_db
from app.errors import ApiError
from app.event_types import find_event_type
from app.occupancy import conflicts_with_booking, from_stored, to_stored
from app.schemas import ApiModel
from app.slots import window_slots

GuestName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
GuestEmail = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, min_length=1, max_length=50, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    ),
]


class CreateBooking(ApiModel):
    event_type_id: str
    start: AwareDatetime
    guest_name: GuestName
    guest_email: GuestEmail


class Booking(ApiModel):
    id: int
    event_type_id: str
    start: datetime
    end: datetime
    guest_name: str
    guest_email: str
    created_at: datetime


def invalid_slot() -> ApiError:
    return ApiError(422, "invalid_slot", "The start is not a free slot of this event type")


router = APIRouter()


@router.post("/api/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(
    body: CreateBooking,
    db: Annotated[Database, Depends(get_db)],
    now: Now,
    timezone: CalendarTimezone,
) -> Booking:
    with db.connect() as connection:
        event_type = find_event_type(connection, body.event_type_id)
        if event_type is None:
            raise invalid_slot()
        # The slots the type could offer ignoring bookings: the grid, hours and window rules
        # are those of the slots endpoint, so a start is valid exactly when it is one of them.
        offered = {
            slot.start
            for day in window_slots(now, timezone, event_type.duration_minutes)
            for slot in day.slots
        }
        if body.start not in offered:
            raise invalid_slot()

        end = body.start + timedelta(minutes=event_type.duration_minutes)
        created_at = now.replace(microsecond=0)
        # Check and insert under one write lock (ADR 0002); the connection is in autocommit mode.
        connection.execute("BEGIN IMMEDIATE")
        try:
            if conflicts_with_booking(connection, body.start, end):
                raise ApiError(409, "slot_taken", "The time overlaps an existing booking")
            booking_id = _insert(connection, body, end, created_at)
            connection.execute("COMMIT")
        except BaseException:
            connection.execute("ROLLBACK")
            raise

    return Booking(
        id=booking_id,
        event_type_id=body.event_type_id,
        start=body.start.astimezone(timezone),
        end=end.astimezone(timezone),
        guest_name=body.guest_name,
        guest_email=body.guest_email,
        created_at=created_at.astimezone(timezone),
    )


def _insert(
    connection: sqlite3.Connection, body: CreateBooking, end: datetime, created_at: datetime
) -> int:
    cursor = connection.execute(
        "INSERT INTO bookings (event_type_id, start_utc, end_utc, guest_name, guest_email, "
        "created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (
            body.event_type_id,
            to_stored(body.start),
            to_stored(end),
            body.guest_name,
            body.guest_email,
            to_stored(created_at),
        ),
    )
    assert cursor.lastrowid is not None
    return cursor.lastrowid


@router.get("/api/admin/bookings")
def list_upcoming_bookings(
    db: Annotated[Database, Depends(get_db)], now: Now, timezone: CalendarTimezone
) -> list[Booking]:
    """Bookings that end later than now, earliest start first; no pagination."""
    with db.connect() as connection:
        rows = connection.execute(
            "SELECT id, event_type_id, start_utc, end_utc, guest_name, guest_email, created_at "
            "FROM bookings WHERE end_utc > ? ORDER BY start_utc",
            (to_stored(now),),
        ).fetchall()
    return [
        Booking(
            id=row["id"],
            event_type_id=row["event_type_id"],
            start=from_stored(row["start_utc"]).astimezone(timezone),
            end=from_stored(row["end_utc"]).astimezone(timezone),
            guest_name=row["guest_name"],
            guest_email=row["guest_email"],
            created_at=from_stored(row["created_at"]).astimezone(timezone),
        )
        for row in rows
    ]
