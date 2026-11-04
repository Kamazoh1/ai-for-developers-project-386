import { Button, Group, Paper, Skeleton, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { calendarApiGet, eventTypesApiSlots } from "../api/sdk.gen.ts";
import type { Slot, SlotDay } from "../api/types.gen.ts";
import { RequestBoundary } from "../request/RequestBoundary.tsx";
import { useRequest } from "../request/useRequest.ts";

// Days are plain dates ("2026-11-06"); format them as UTC so the guest's zone cannot shift them.
const weekdayShort = new Intl.DateTimeFormat("ru-RU", { weekday: "short", timeZone: "UTC" });
const dayAndMonth = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const weekdayLong = new Intl.DateTimeFormat("ru-RU", { weekday: "long", timeZone: "UTC" });

const asUtc = (date: string) => new Date(`${date}T00:00:00Z`);

// Browsers disagree on Russian zone abbreviations (`МСК`, `MSK` or `GMT+3`), so name them ourselves.
const RUSSIAN_ZONES: Record<string, string> = {
  "Europe/Kaliningrad": "МСК−1",
  "Europe/Moscow": "МСК",
  "Europe/Samara": "МСК+1",
  "Asia/Yekaterinburg": "МСК+2",
  "Asia/Omsk": "МСК+3",
  "Asia/Krasnoyarsk": "МСК+4",
  "Asia/Irkutsk": "МСК+5",
  "Asia/Yakutsk": "МСК+6",
  "Asia/Vladivostok": "МСК+7",
  "Asia/Magadan": "МСК+8",
  "Asia/Kamchatka": "МСК+9",
};

/** Short label of the calendar timezone: `МСК` for Moscow, else the browser's name (`GMT+9`). */
export function zoneLabel(timeZone: string): string {
  const known = RUSSIAN_ZONES[timeZone];
  if (known) return known;
  const parts = new Intl.DateTimeFormat("ru-RU", { timeZone, timeZoneName: "short" }).formatToParts(
    new Date(),
  );
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

/** `09:00` out of `2026-11-06T09:00:00+03:00`: slots arrive in the calendar zone's offset. */
const localTime = (instant: string) => instant.slice(11, 16);

export const slotLabel = (slot: Slot) => `${localTime(slot.start)} – ${localTime(slot.end)}`;

function DayButton({
  day,
  selected,
  onSelect,
}: {
  day: SlotDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const date = asUtc(day.date);
  return (
    <Button
      variant={selected ? "filled" : "default"}
      disabled={day.slots.length === 0}
      aria-pressed={selected}
      aria-label={`${dayAndMonth.format(date)}, ${weekdayLong.format(date)}`}
      onClick={onSelect}
      h={56}
      px={4}
    >
      <Stack gap={0} align="center">
        <Text size="xs" tt="uppercase" inherit fw={400}>
          {weekdayShort.format(date)}
        </Text>
        <Text fw={700} fz="lg" lh={1.2} inherit>
          {date.getUTCDate()}
        </Text>
      </Stack>
    </Button>
  );
}

function SlotsSkeleton() {
  return (
    <SimpleGrid cols={{ base: 4, xs: 7 }} spacing="xs">
      {Array.from({ length: 14 }, (_, n) => (
        <Skeleton key={n} height={56} />
      ))}
    </SimpleGrid>
  );
}

function Window({ days, zone }: { days: SlotDay[]; zone: string }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selected = days.find((day) => day.date === selectedDate);

  const nothingFree = days.every((day) => day.slots.length === 0);

  return (
    <Stack>
      <SimpleGrid cols={{ base: 4, xs: 7 }} spacing="xs" role="group" aria-label="Дни записи">
        {days.map((day) => (
          <DayButton
            key={day.date}
            day={day}
            selected={day.date === selectedDate}
            onSelect={() => setSelectedDate(day.date)}
          />
        ))}
      </SimpleGrid>
      {selected ? (
        <Paper
          component="section"
          withBorder
          p="md"
          aria-label={`Свободное время, ${dayAndMonth.format(asUtc(selected.date))}`}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="baseline">
              <Title order={2} size="h4">
                {`${dayAndMonth.format(asUtc(selected.date))}, ${weekdayLong.format(asUtc(selected.date))}`}
              </Title>
              <Text size="sm" c="dimmed">{`Время по ${zone}`}</Text>
            </Group>
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="xs" component="ul" p={0} m={0}>
              {selected.slots.map((slot) => (
                <Text key={slot.start} component="li" ta="center" style={{ listStyle: "none" }}>
                  {slotLabel(slot)}
                </Text>
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>
      ) : nothingFree ? (
        <Text c="dimmed">
          На ближайшие две недели свободного времени нет. Загляните позже или выберите другой тип
          звонка
        </Text>
      ) : (
        <Text c="dimmed">Выберите день, чтобы увидеть свободное время.</Text>
      )}
    </Stack>
  );
}

/** The booking window of an event type: 14 days to choose from, the free slots of the chosen one. */
export function SlotPicker({ eventTypeId }: { eventTypeId: string }) {
  const calendar = useRequest(() => calendarApiGet());
  const slots = useRequest(() => eventTypesApiSlots({ path: { id: eventTypeId } }), eventTypeId);

  return (
    <RequestBoundary request={slots} skeleton={<SlotsSkeleton />}>
      {({ days }) => (
        <RequestBoundary request={calendar}>
          {(settings) => <Window days={days} zone={zoneLabel(settings.timezone)} />}
        </RequestBoundary>
      )}
    </RequestBoundary>
  );
}
