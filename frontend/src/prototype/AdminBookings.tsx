// PROTOTYPE (throwaway): three variants of /admin/bookings. Switch with ?variant=A|B|C.
import { Badge, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import {
  type Booking,
  ZONE_LABEL,
  dayKey,
  formatDay,
  formatDayShort,
  formatDuration,
  formatTime,
  initialBookings,
  typeById,
} from "./data.ts";
import { PrototypeSwitcher, type VariantDef, useVariant } from "./PrototypeSwitcher.tsx";
import { useEventTypes } from "./store.ts";

const VARIANTS: VariantDef[] = [
  { key: "A", name: "Таблица" },
  { key: "B", name: "По дням" },
  { key: "C", name: "Карточки с акцентом" },
];

const subtitle = `Время в поясе календаря (${ZONE_LABEL}), по возрастанию начала`;

function useTypeName() {
  const types = useEventTypes();
  return (b: Booking) => typeById(types, b.eventTypeId)?.name ?? b.eventTypeId;
}

function VariantA({ bookings }: { bookings: Booking[] }) {
  const typeName = useTypeName();
  return (
    <Stack>
      <Stack gap={2}>
        <Title order={2}>Предстоящие встречи</Title>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </Stack>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Когда</Table.Th>
            <Table.Th>Тип</Table.Th>
            <Table.Th>Гость</Table.Th>
            <Table.Th visibleFrom="sm">Email</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bookings.map((b) => (
            <Table.Tr key={b.id}>
              <Table.Td>
                {formatDayShort(b.start)}, {formatTime(b.start)}–{formatTime(b.end)}
              </Table.Td>
              <Table.Td>{typeName(b)}</Table.Td>
              <Table.Td fw={600}>{b.guestName}</Table.Td>
              <Table.Td visibleFrom="sm" c="dimmed">
                {b.guestEmail}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function VariantB({ bookings }: { bookings: Booking[] }) {
  const typeName = useTypeName();
  const days = new Map<string, Booking[]>();
  for (const b of bookings) {
    const k = dayKey(b.start);
    days.set(k, [...(days.get(k) ?? []), b]);
  }
  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={2}>Предстоящие встречи</Title>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </Stack>
      {[...days.entries()].map(([k, list]) => (
        <Stack key={k} gap="xs">
          <Text fw={700} tt="capitalize">
            {formatDay(list[0].start)}
          </Text>
          {list.map((b) => (
            <Group key={b.id} wrap="nowrap" align="flex-start" gap="md">
              <Text w={110} fw={600} style={{ flexShrink: 0 }}>
                {formatTime(b.start)}–{formatTime(b.end)}
              </Text>
              <Stack gap={0}>
                <Text>
                  {b.guestName}{" "}
                  <Text span c="dimmed" size="sm">
                    · {typeName(b)}
                  </Text>
                </Text>
                <Text size="sm" c="dimmed">
                  {b.guestEmail}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function VariantC({ bookings }: { bookings: Booking[] }) {
  const typeName = useTypeName();
  return (
    <Stack>
      <Stack gap={2}>
        <Title order={2}>Предстоящие встречи</Title>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </Stack>
      {bookings.map((b, i) => (
        <Paper
          key={b.id}
          withBorder
          radius="md"
          p="md"
          style={{ borderLeft: `4px solid var(--mantine-color-brand-${i === 0 ? 5 : 2})` }}
        >
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Stack gap={2}>
              <Text fw={700}>
                {formatDayShort(b.start)}, {formatTime(b.start)}–{formatTime(b.end)}
              </Text>
              <Text>{b.guestName}</Text>
              <Text size="sm" c="dimmed">
                {b.guestEmail}
              </Text>
            </Stack>
            <Stack gap={4} align="flex-end">
              <Badge variant="light">{typeName(b)}</Badge>
              <Text size="xs" c="dimmed">
                {formatDuration((b.end.getTime() - b.start.getTime()) / 60_000)}
              </Text>
              {i === 0 && (
                <Badge color="green" variant="dot">
                  Ближайшая
                </Badge>
              )}
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

export default function AdminBookings() {
  const { current, go } = useVariant(VARIANTS);
  const bookings = initialBookings;
  return (
    <>
      {current === "A" && <VariantA bookings={bookings} />}
      {current === "B" && <VariantB bookings={bookings} />}
      {current === "C" && <VariantC bookings={bookings} />}
      <PrototypeSwitcher variants={VARIANTS} current={current} go={go} />
    </>
  );
}
