// PROTOTYPE (throwaway): three variants of the event type step on /book. Switch with ?variant=A|B|C.
import {
  Badge,
  Button,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconArrowRight, IconClock } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { type EventType, OWNER_NAME, formatDuration } from "./data.ts";
import { PrototypeSwitcher, type VariantDef, useVariant } from "./PrototypeSwitcher.tsx";
import { useEventTypes } from "./store.ts";

const VARIANTS: VariantDef[] = [
  { key: "A", name: "Сетка карточек" },
  { key: "B", name: "Список строк" },
  { key: "C", name: "Выбор + панель" },
];

function Heading() {
  return (
    <Stack gap={4} mb="lg">
      <Title order={1}>Запись на звонок</Title>
      <Text c="dimmed">Запись к: {OWNER_NAME}. Выберите тип звонка.</Text>
    </Stack>
  );
}

function VariantA({ types }: { types: EventType[] }) {
  return (
    <>
      <Heading />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {types.map((t) => (
          <Card
            key={t.id}
            withBorder
            padding="lg"
            radius="lg"
            component={Link}
            to={`/book/${t.id}`}
            style={{ textDecoration: "none" }}
          >
            <Stack justify="space-between" h="100%" gap="md">
              <Stack gap={6}>
                <Title order={3} fz="lg">
                  {t.name}
                </Title>
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {t.description || "Без описания"}
                </Text>
              </Stack>
              <Group justify="space-between">
                <Badge variant="light" leftSection={<IconClock size={12} />}>
                  {formatDuration(t.durationMinutes)}
                </Badge>
                <IconArrowRight size={18} />
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

function VariantB({ types }: { types: EventType[] }) {
  return (
    <>
      <Heading />
      <Stack gap="xs">
        {types.map((t) => (
          <Paper
            key={t.id}
            withBorder
            radius="md"
            p="md"
            component={Link}
            to={`/book/${t.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Group wrap="nowrap" gap="lg">
              <Stack gap={0} align="center" w={64} style={{ flexShrink: 0 }}>
                <Text fz={28} fw={700} lh={1} c="brand">
                  {t.durationMinutes}
                </Text>
                <Text size="xs" c="dimmed">
                  минут
                </Text>
              </Stack>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600}>{t.name}</Text>
                <Text size="sm" c="dimmed" truncate>
                  {t.description || "Без описания"}
                </Text>
              </Stack>
              <IconArrowRight size={18} />
            </Group>
          </Paper>
        ))}
      </Stack>
    </>
  );
}

function VariantC({ types }: { types: EventType[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = types.find((t) => t.id === selectedId) ?? null;
  return (
    <>
      <Heading />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack gap="xs">
          {types.map((t) => (
            <UnstyledButton
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              aria-pressed={t.id === selectedId}
            >
              <Paper
                withBorder
                radius="md"
                p="md"
                style={
                  t.id === selectedId
                    ? { borderColor: "var(--mantine-color-brand-5)", borderWidth: 2 }
                    : undefined
                }
              >
                <Group justify="space-between">
                  <Text fw={600}>{t.name}</Text>
                  <Text size="sm" c="dimmed">
                    {formatDuration(t.durationMinutes)}
                  </Text>
                </Group>
              </Paper>
            </UnstyledButton>
          ))}
        </Stack>
        <Paper withBorder radius="lg" p="xl" mih={180}>
          {selected ? (
            <Stack gap="sm">
              <Title order={3}>{selected.name}</Title>
              <Badge variant="light" w="fit-content">
                {formatDuration(selected.durationMinutes)}
              </Badge>
              <Text c="dimmed">{selected.description || "Без описания"}</Text>
              <Button
                component={Link}
                to={`/book/${selected.id}`}
                rightSection={<IconArrowRight size={16} />}
                w="fit-content"
              >
                Выбрать время
              </Button>
            </Stack>
          ) : (
            <Text c="dimmed">Выберите тип слева, здесь появится описание.</Text>
          )}
        </Paper>
      </SimpleGrid>
    </>
  );
}

export default function BookTypes() {
  const types = useEventTypes();
  const { current, go } = useVariant(VARIANTS);
  return (
    <>
      {current === "A" && <VariantA types={types} />}
      {current === "B" && <VariantB types={types} />}
      {current === "C" && <VariantC types={types} />}
      <PrototypeSwitcher variants={VARIANTS} current={current} go={go} />
    </>
  );
}
