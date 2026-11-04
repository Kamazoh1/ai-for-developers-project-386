import { Stack, Text, Title } from "@mantine/core";
import { calendarApiGet } from "../api/sdk.gen.ts";
import { RequestBoundary } from "../request/RequestBoundary.tsx";
import { useRequest } from "../request/useRequest.ts";

export default function Book() {
  const calendar = useRequest(() => calendarApiGet());

  return (
    <Stack>
      <Title order={1}>Запись на звонок</Title>
      <RequestBoundary request={calendar}>
        {(settings) => <Text>{`Запись к: ${settings.owner.name}`}</Text>}
      </RequestBoundary>
    </Stack>
  );
}
