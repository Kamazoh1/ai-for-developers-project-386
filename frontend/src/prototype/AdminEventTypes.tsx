// PROTOTYPE (throwaway): three variants of /admin/event-types. Switch with ?variant=A|B|C.
import {
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import EventTypeForm from "./EventTypeForm.tsx";
import { type EventType, formatDuration } from "./data.ts";
import { PrototypeSwitcher, type VariantDef, useVariant } from "./PrototypeSwitcher.tsx";
import { useEventTypes } from "./store.ts";

const VARIANTS: VariantDef[] = [
  { key: "A", name: "Список + форма сбоку" },
  { key: "B", name: "Таблица, форма сворачивается" },
  { key: "C", name: "Карточки + модальное окно" },
];

function VariantA({ types }: { types: EventType[] }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 5 }} spacing="lg">
      <Stack gap="xs" style={{ gridColumn: "span 3" }}>
        <Title order={2}>Типы событий</Title>
        {types.map((t) => (
          <Paper key={t.id} withBorder radius="md" p="md">
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={0}>
                <Text fw={600}>{t.name}</Text>
                <Text size="xs" c="dimmed">
                  /{t.id}
                </Text>
              </Stack>
              <Badge variant="light">{formatDuration(t.durationMinutes)}</Badge>
            </Group>
            {t.description && (
              <Text size="sm" c="dimmed" mt={6}>
                {t.description}
              </Text>
            )}
          </Paper>
        ))}
      </Stack>
      <Paper withBorder radius="lg" p="lg" style={{ gridColumn: "span 2", alignSelf: "start" }}>
        <Title order={4} mb="sm">
          Новый тип
        </Title>
        <EventTypeForm />
      </Paper>
    </SimpleGrid>
  );
}

function VariantB({ types }: { types: EventType[] }) {
  const [open, { toggle, close }] = useDisclosure(false);
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Типы событий</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          variant={open ? "default" : "filled"}
          onClick={toggle}
        >
          {open ? "Скрыть форму" : "Создать тип"}
        </Button>
      </Group>
      <Collapse expanded={open}>
        <Paper withBorder radius="lg" p="lg" maw={520}>
          <EventTypeForm onCreated={close} />
        </Paper>
      </Collapse>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Id</Table.Th>
            <Table.Th>Длительность</Table.Th>
            <Table.Th visibleFrom="sm">Описание</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {types.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td fw={600}>{t.name}</Table.Td>
              <Table.Td c="dimmed">{t.id}</Table.Td>
              <Table.Td>{formatDuration(t.durationMinutes)}</Table.Td>
              <Table.Td visibleFrom="sm" c="dimmed">
                {t.description}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function VariantC({ types }: { types: EventType[] }) {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Типы событий</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Создать тип
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {types.map((t) => (
          <Card key={t.id} withBorder radius="lg" padding="lg">
            <Text fz={32} fw={700} c="brand" lh={1}>
              {t.durationMinutes}
              <Text span size="sm" c="dimmed">
                {" "}
                мин
              </Text>
            </Text>
            <Text fw={600} mt="xs">
              {t.name}
            </Text>
            <Text size="xs" c="dimmed">
              /{t.id}
            </Text>
            <Text size="sm" c="dimmed" mt="xs" lineClamp={3}>
              {t.description || "Без описания"}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
      <Modal opened={opened} onClose={close} title="Новый тип события">
        <EventTypeForm onCreated={close} />
      </Modal>
    </Stack>
  );
}

export default function AdminEventTypes() {
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
