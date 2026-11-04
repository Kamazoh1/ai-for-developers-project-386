import { Anchor, Badge, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useParams } from "react-router";
import { eventTypesApiGet } from "../api/sdk.gen.ts";
import { RequestBoundary } from "../request/RequestBoundary.tsx";
import { useRequest } from "../request/useRequest.ts";
import { SlotPicker } from "./SlotPicker.tsx";

function BackToTypes() {
  return (
    <Anchor component={Link} to="/book" w="fit-content">
      <IconArrowLeft size={14} aria-hidden /> К выбору типа
    </Anchor>
  );
}

/** `/book/:eventTypeId`: the type the guest chose, its 14-day window and free slots. */
export default function BookEventType() {
  const { eventTypeId = "" } = useParams();
  // An unknown id is an answer, not a failure: it resolves to `null`; anything else wrong is an error.
  const eventType = useRequest(async () => {
    const result = await eventTypesApiGet({ path: { id: eventTypeId } });
    return result.response?.status === 404 ? { data: null } : result;
  }, eventTypeId);

  return (
    <Stack>
      <RequestBoundary request={eventType}>
        {(type) =>
          type === null ? (
            <>
              <Title order={1}>Тип события не найден</Title>
              <BackToTypes />
            </>
          ) : (
            <>
              <Title order={1}>{type.name}</Title>
              <Badge variant="light" w="fit-content">
                {`${type.durationMinutes} минут`}
              </Badge>
              {type.description && <Text c="dimmed">{type.description}</Text>}
              <SlotPicker eventTypeId={type.id} />
              <BackToTypes />
            </>
          )
        }
      </RequestBoundary>
    </Stack>
  );
}
