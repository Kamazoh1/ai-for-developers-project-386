from datetime import time

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app import settings


class ApiModel(BaseModel):
    """Base for API payloads: camelCase on the wire, as in the contract."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class WorkingHours(ApiModel):
    start: time
    end: time


class Owner(ApiModel):
    name: str


class CalendarSettings(ApiModel):
    timezone: str
    working_hours: WorkingHours
    slot_step_minutes: int
    booking_window_days: int
    owner: Owner


def create_app() -> FastAPI:
    """Build the app. Reads settings from the environment and refuses to start on bad ones."""
    config = settings.Settings.from_env()
    app = FastAPI(title="Call Calendar")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/calendar")
    def get_calendar() -> CalendarSettings:
        return CalendarSettings(
            timezone=config.calendar_timezone,
            working_hours=WorkingHours(
                start=settings.WORKING_HOURS_START, end=settings.WORKING_HOURS_END
            ),
            slot_step_minutes=settings.SLOT_STEP_MINUTES,
            booking_window_days=settings.BOOKING_WINDOW_DAYS,
            owner=Owner(name=settings.OWNER_NAME),
        )

    return app


app = create_app()
