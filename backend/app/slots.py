"""Free slots of the booking window: the rules, as pure functions of "now".

``window_slots`` answers "which slots could an event type of this length offer
over the booking window, ignoring bookings?". It knows the calendar timezone,
the working hours, the 30-minute start grid and the "strictly after now" rule,
and nothing about storage. Booked intervals are subtracted by the caller (the
booking flow), which keeps this unit testable on its own.

Wall-clock arithmetic across daylight-saving changes is done on UTC instants.
"""

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from app import settings


@dataclass(frozen=True)
class Slot:
    start: datetime
    end: datetime


@dataclass(frozen=True)
class SlotDay:
    date: date
    slots: list[Slot]


def window_slots(now: datetime, timezone: ZoneInfo, duration_minutes: int) -> list[SlotDay]:
    """One ``SlotDay`` per day of the booking window, today first, empty days included.

    ``now`` is any timezone-aware instant. A slot belongs to the day of its start in
    ``timezone``; its ``start`` and ``end`` are in that zone's offset. Slots of today
    are kept only if they start strictly after ``now``.
    """
    today = now.astimezone(timezone).date()
    length = timedelta(minutes=duration_minutes)
    return [
        SlotDay(day, _day_slots(day, timezone, length, now))
        for day in (today + timedelta(days=n) for n in range(settings.BOOKING_WINDOW_DAYS))
    ]


def _day_slots(day: date, timezone: ZoneInfo, length: timedelta, now: datetime) -> list[Slot]:
    opens = datetime.combine(day, settings.WORKING_HOURS_START, tzinfo=timezone)
    closes = datetime.combine(day, settings.WORKING_HOURS_END, tzinfo=timezone)
    step = timedelta(minutes=settings.SLOT_STEP_MINUTES)

    slots: list[Slot] = []
    start = opens.astimezone(UTC)
    while (end := start + length) <= closes:
        if start > now:
            slots.append(Slot(start.astimezone(timezone), end.astimezone(timezone)))
        start += step
    return slots
