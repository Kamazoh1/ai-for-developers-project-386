import "@typespec/http";

using TypeSpec.Http;

@service(#{ title: "Call Calendar" })
@server("http://localhost:8000", "Local development")
namespace CallCalendar;

model Health {
  status: "ok";
}

@route("/health")
interface Status {
  @get check(): Health;
}

model WorkingHours {
  /** Start of the owner's working day, in the calendar timezone. */
  start: plainTime;

  /** End of the owner's working day, in the calendar timezone. */
  end: plainTime;
}

model Owner {
  /** Display name of the calendar owner. */
  name: string;
}

/** Read-only calendar settings and the owner's profile. */
model CalendarSettings {
  /** IANA name of the calendar timezone, e.g. Europe/Moscow. */
  timezone: string;

  workingHours: WorkingHours;

  /** Step between allowed slot start times, in minutes. */
  slotStepMinutes: int32;

  /** Number of calendar days, starting today, in which slots can be booked. */
  bookingWindowDays: int32;

  owner: Owner;
}

@route("/api/calendar")
interface CalendarApi {
  @get get(): CalendarSettings;
}
