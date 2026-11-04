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

// --- error model -----------------------------------------------------------
// Every error response is `{ code, message, fields? }`: `code` is the stable machine
// value the UI turns into Russian text, `message` is short English for developers.

model FieldError {
  /** Name of the offending request field, as it appears in the request body. */
  field: string;

  message: string;
}

/** The request body is malformed or breaks a field rule. */
@error
model ValidationError {
  @statusCode _: 422;
  code: "validation_error";
  message: string;

  /** One entry per invalid field. */
  fields: FieldError[];
}

/** An event type with this id already exists. */
@error
model EventTypeExists {
  @statusCode _: 409;
  code: "event_type_exists";
  message: string;
}

// --- event types -----------------------------------------------------------

/** A kind of call the owner offers. */
model EventType {
  /** Owner-chosen slug; the type's only identifier (ADR 0003). */
  id: string;

  name: string;

  /** Empty when the owner gave none. */
  description: string;

  /** Length of the call, and of its slots, in minutes. */
  durationMinutes: int32;
}

model CreateEventType {
  /** Lowercase letters, numbers and hyphens, 1-40 characters. Uppercase is rejected, not normalized. */
  @minLength(1)
  @maxLength(40)
  @pattern("^[a-z0-9-]+$")
  id: string;

  @minLength(1)
  @maxLength(100)
  name: string;

  @maxLength(500)
  description?: string;

  /** Whole minutes, 5-480, a multiple of 5. */
  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@route("/api/event-types")
interface EventTypesApi {
  /** All event types, in creation order. */
  @get list(): EventType[];
}

@route("/api/admin/event-types")
interface AdminEventTypesApi {
  /** Create an event type. */
  @post create(@body body: CreateEventType):
    | {
        @statusCode _: 201;
        @body body: EventType;
      }
    | ValidationError
    | EventTypeExists;
}
