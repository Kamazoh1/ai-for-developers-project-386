import { Paper, Stack, Text, Title } from "@mantine/core";

/** Bookings do not exist yet, so for now this page only shows its empty state. */
export default function AdminBookings() {
  return (
    <Stack>
      <Title order={2}>Предстоящие встречи</Title>
      <Paper withBorder radius="lg" p="xl">
        <Text c="dimmed" ta="center">
          Предстоящих встреч нет. Когда гость запишется, встреча появится здесь.
        </Text>
      </Paper>
    </Stack>
  );
}
