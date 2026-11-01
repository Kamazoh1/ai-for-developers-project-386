import { Badge, Button, List, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router";
import classes from "./Landing.module.css";

const FEATURES = [
  "Фиксированные 30-минутные слоты с 09:00 до 18:00.",
  "Проверка конфликта при бронировании.",
  "Просмотр предстоящих событий в отдельном разделе.",
];

export default function Landing() {
  return (
    <>
      <div className={classes.backdrop} aria-hidden />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Stack align="flex-start" gap="md">
          <Badge variant="white" size="lg">
            Быстрая запись на звонок
          </Badge>
          <Title order={1}>Calendar</Title>
          <Text size="lg" c="dimmed">
            Один экран, понятные слоты, быстрая бронь. Выберите время и запишитесь на звонок без
            лишних шагов.
          </Text>
          <Button component={Link} to="/book" size="lg" rightSection={<IconArrowRight size={18} />}>
            Записаться
          </Button>
        </Stack>
        <Paper withBorder radius="lg" p="lg">
          <Title order={3} mb="sm">
            Что доступно прямо сейчас
          </Title>
          <List size="sm" c="dimmed" spacing="xs">
            {FEATURES.map((feature) => (
              <List.Item key={feature}>{feature}</List.Item>
            ))}
          </List>
        </Paper>
      </SimpleGrid>
    </>
  );
}
