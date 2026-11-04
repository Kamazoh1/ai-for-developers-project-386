// PROTOTYPE (throwaway): create form with the validation rules from the model ticket.
import { Button, NumberInput, Stack, TextInput, Textarea } from "@mantine/core";
import { useState } from "react";
import { type EventTypeErrors, type EventTypeInput, validateEventType } from "./data.ts";
import { addEventType, useEventTypes } from "./store.ts";

const EMPTY: EventTypeInput = { id: "", name: "", description: "", duration: 30 };

export default function EventTypeForm({ onCreated }: { onCreated?: () => void }) {
  const existing = useEventTypes();
  const [values, setValues] = useState<EventTypeInput>(EMPTY);
  const [errors, setErrors] = useState<EventTypeErrors>({});

  const set = <K extends keyof EventTypeInput>(key: K, value: EventTypeInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateEventType(
      values,
      existing.map((t) => t.id),
    );
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    addEventType({
      id: values.id,
      name: values.name.trim(),
      description: values.description.trim(),
      durationMinutes: Number(values.duration),
    });
    setValues(EMPTY);
    onCreated?.();
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="sm">
        <TextInput
          label="Название"
          value={values.name}
          onChange={(e) => set("name", e.currentTarget.value)}
          error={errors.name}
        />
        <TextInput
          label="Идентификатор (slug)"
          description="Попадёт в адрес: /book/ваш-id"
          placeholder="intro-call"
          value={values.id}
          onChange={(e) => set("id", e.currentTarget.value)}
          error={errors.id}
        />
        <Textarea
          label="Описание"
          autosize
          minRows={2}
          value={values.description}
          onChange={(e) => set("description", e.currentTarget.value)}
          error={errors.description}
        />
        <NumberInput
          label="Длительность, минут"
          step={5}
          value={values.duration}
          onChange={(v) => set("duration", v)}
          error={errors.duration}
        />
        <Button type="submit">Создать тип события</Button>
      </Stack>
    </form>
  );
}
