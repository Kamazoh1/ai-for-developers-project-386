// PROTOTYPE (throwaway): in-memory mock data for ticket "Прототип: выбор типа события и админка".

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Booking {
  id: number;
  eventTypeId: string;
  start: Date;
  end: Date;
  guestName: string;
  guestEmail: string;
}

export const OWNER_NAME = "Роман Десятов";
export const ZONE_LABEL = "МСК";
const TIME_ZONE = "Europe/Moscow";

export const initialEventTypes: EventType[] = [
  {
    id: "intro-call",
    name: "Знакомство",
    description: "Короткий созвон: расскажете о задаче, я отвечу, подхожу ли вам.",
    durationMinutes: 15,
  },
  {
    id: "code-review",
    name: "Разбор кода",
    description: "Совместный просмотр вашего проекта или pull request.",
    durationMinutes: 30,
  },
  {
    id: "consultation",
    name: "Консультация",
    description: "Разбор вашего вопроса с рекомендациями и планом действий.",
    durationMinutes: 60,
  },
];

export function typeById(types: EventType[], id: string): EventType | undefined {
  return types.find((t) => t.id === id);
}

function at(daysFromToday: number, hour: number, minute: number, minutes: number) {
  const start = new Date();
  start.setDate(start.getDate() + daysFromToday);
  start.setHours(hour, minute, 0, 0);
  return { start, end: new Date(start.getTime() + minutes * 60_000) };
}

export const initialBookings: Booking[] = [
  {
    id: 1,
    eventTypeId: "consultation",
    ...at(0, 17, 0, 60),
    guestName: "Анна Смирнова",
    guestEmail: "anna@example.com",
  },
  {
    id: 2,
    eventTypeId: "intro-call",
    ...at(1, 10, 0, 15),
    guestName: "Пётр Иванов",
    guestEmail: "petr.ivanov@example.com",
  },
  {
    id: 3,
    eventTypeId: "code-review",
    ...at(1, 11, 30, 30),
    guestName: "Мария Ковалёва",
    guestEmail: "maria@example.com",
  },
  {
    id: 4,
    eventTypeId: "consultation",
    ...at(1, 15, 0, 60),
    guestName: "Олег",
    guestEmail: "oleg@example.com",
  },
  {
    id: 5,
    eventTypeId: "intro-call",
    ...at(3, 9, 30, 15),
    guestName: "Екатерина Л.",
    guestEmail: "kate@example.com",
  },
  {
    id: 6,
    eventTypeId: "code-review",
    ...at(6, 14, 0, 30),
    guestName: "Дмитрий Петров",
    guestEmail: "dmitry.petrov@example.com",
  },
].sort((a, b) => a.start.getTime() - b.start.getTime());

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
}

const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const dayFmt = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});
const dayShortFmt = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});

export const formatTime = (d: Date) => timeFmt.format(d);
export const formatDay = (d: Date) => dayFmt.format(d);
export const formatDayShort = (d: Date) => dayShortFmt.format(d);
export const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: TIME_ZONE });

export interface EventTypeInput {
  id: string;
  name: string;
  description: string;
  duration: number | string;
}

export type EventTypeErrors = Partial<Record<keyof EventTypeInput, string>>;

// Rules from ticket "Модель: ..." (slug, name, description, duration).
export function validateEventType(input: EventTypeInput, existingIds: string[]): EventTypeErrors {
  const errors: EventTypeErrors = {};
  if (!/^[a-z0-9-]{1,40}$/.test(input.id)) {
    errors.id = "Только строчные латинские буквы, цифры и дефис, до 40 символов";
  } else if (existingIds.includes(input.id)) {
    errors.id = "Тип с таким id уже есть";
  }
  const name = input.name.trim();
  if (name.length < 1 || name.length > 100) errors.name = "От 1 до 100 символов";
  if (input.description.length > 500) errors.description = "Не больше 500 символов";
  const d = Number(input.duration);
  if (input.duration === "" || !Number.isInteger(d) || d < 5 || d > 480 || d % 5 !== 0) {
    errors.duration = "Целое число минут от 5 до 480, кратное 5";
  }
  return errors;
}
