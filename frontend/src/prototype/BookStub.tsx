// PROTOTYPE (throwaway): placeholder for /book/:eventTypeId (calendar and slots are out of this prototype).
import { Anchor, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "react-router";
import { typeById } from "./data.ts";
import { useEventTypes } from "./store.ts";

export default function BookStub() {
  const { eventTypeId = "" } = useParams();
  const type = typeById(useEventTypes(), eventTypeId);
  return (
    <Stack>
      <Title order={1}>{type ? type.name : "Тип события не найден"}</Title>
      <Text c="dimmed">
        {type ? "Календарь, слоты и форма — вне этого прототипа." : "Такого типа нет."}
      </Text>
      <Anchor component={Link} to="/book">
        ← К выбору типа
      </Anchor>
    </Stack>
  );
}
