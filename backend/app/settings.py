"""Calendar configuration.

The calendar timezone (ADR 0001) and the SQLite database path are configurable;
the remaining parameters and the owner profile are constants exposed read-only
by the API.
"""

import os
from dataclasses import dataclass
from datetime import time
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

TIMEZONE_ENV = "CALENDAR_TIMEZONE"
DEFAULT_TIMEZONE = "Europe/Moscow"

DATABASE_PATH_ENV = "DATABASE_PATH"
DEFAULT_DATABASE_PATH = "call-calendar.db"  # relative to the working directory

WORKING_HOURS_START = time(9, 0)
WORKING_HOURS_END = time(18, 0)
SLOT_STEP_MINUTES = 30
BOOKING_WINDOW_DAYS = 14
OWNER_NAME = "Алексей Иванов"


@dataclass(frozen=True)
class Settings:
    calendar_timezone: str
    database_path: str

    @classmethod
    def from_env(cls) -> "Settings":
        name = os.environ.get(TIMEZONE_ENV, DEFAULT_TIMEZONE)
        try:
            ZoneInfo(name)
        except (ZoneInfoNotFoundError, ValueError) as error:
            raise ValueError(
                f"{TIMEZONE_ENV}={name!r} is not a valid IANA time zone "
                f"(expected a name like {DEFAULT_TIMEZONE!r})"
            ) from error
        return cls(
            calendar_timezone=name,
            database_path=os.environ.get(DATABASE_PATH_ENV, DEFAULT_DATABASE_PATH),
        )
