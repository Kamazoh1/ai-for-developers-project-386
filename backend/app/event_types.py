"""Event types: storage and the public and admin endpoints (ADR 0003)."""

import sqlite3
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import Field, StringConstraints

from app.clock import CalendarTimezone, Now
from app.db import Database, get_db
from app.errors import ApiError
from app.schemas import ApiModel
from app.slots import window_slots

Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9-]{1,40}$")]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]
# Strict: a JSON string or boolean is not a number of minutes.
DurationMinutes = Annotated[int, Field(strict=True, ge=5, le=480, multiple_of=5)]


class EventType(ApiModel):
    id: str
    name: str
    description: str
    duration_minutes: int


class CreateEventType(ApiModel):
    id: Slug
    name: Name
    description: Description = ""
    duration_minutes: DurationMinutes


router = APIRouter()


@router.get("/api/event-types")
def list_event_types(db: Annotated[Database, Depends(get_db)]) -> list[EventType]:
    with db.connect() as connection:
        rows = connection.execute(
            "SELECT id, name, description, duration_minutes FROM event_types ORDER BY rowid"
        ).fetchall()
    return [EventType(**dict(row)) for row in rows]


@router.get("/api/event-types/{event_type_id}")
def get_event_type(event_type_id: str, db: Annotated[Database, Depends(get_db)]) -> EventType:
    with db.connect() as connection:
        row = connection.execute(
            "SELECT id, name, description, duration_minutes FROM event_types WHERE id = ?",
            (event_type_id,),
        ).fetchone()
    if row is None:
        raise ApiError(404, "event_type_not_found", "No event type with this id")
    return EventType(**dict(row))


class Slot(ApiModel):
    start: datetime
    end: datetime


class SlotDay(ApiModel):
    date: date
    slots: list[Slot]


class Slots(ApiModel):
    days: list[SlotDay]


@router.get("/api/event-types/{event_type_id}/slots")
def get_slots(
    event_type_id: str,
    db: Annotated[Database, Depends(get_db)],
    now: Now,
    timezone: CalendarTimezone,
) -> Slots:
    event_type = get_event_type(event_type_id, db)
    days = window_slots(now, timezone, event_type.duration_minutes)
    return Slots(
        days=[
            SlotDay(date=day.date, slots=[Slot(start=s.start, end=s.end) for s in day.slots])
            for day in days
        ]
    )


@router.post("/api/admin/event-types", status_code=status.HTTP_201_CREATED)
def create_event_type(body: CreateEventType, db: Annotated[Database, Depends(get_db)]) -> EventType:
    try:
        with db.connect() as connection:
            connection.execute(
                "INSERT INTO event_types (id, name, description, duration_minutes) "
                "VALUES (?, ?, ?, ?)",
                (body.id, body.name, body.description, body.duration_minutes),
            )
    except sqlite3.IntegrityError as error:
        # The primary key is the only constraint that can fail on this insert.
        raise ApiError(
            409, "event_type_exists", "An event type with this id already exists"
        ) from error
    return EventType(**body.model_dump())
