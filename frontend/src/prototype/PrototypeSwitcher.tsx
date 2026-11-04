// PROTOTYPE (throwaway): floating variant switcher, `?variant=` search param, ← / → keys.
import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

export interface VariantDef {
  key: string;
  name: string;
}

export function useVariant(variants: VariantDef[]) {
  const [params, setParams] = useSearchParams();
  const current = variants.find((v) => v.key === params.get("variant"))?.key ?? variants[0].key;
  const go = useCallback(
    (delta: number) => {
      const i = variants.findIndex((v) => v.key === current);
      const next = variants[(i + delta + variants.length) % variants.length].key;
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("variant", next);
          return p;
        },
        { replace: true },
      );
    },
    [variants, current, setParams],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return { current, go };
}

export function PrototypeSwitcher({
  variants,
  current,
  go,
}: {
  variants: VariantDef[];
  current: string;
  go: (delta: number) => void;
}) {
  const def = variants.find((v) => v.key === current);
  return (
    <Paper
      shadow="xl"
      radius="xl"
      px="md"
      py={6}
      bg="dark.8"
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <Group gap="xs" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => go(-1)}
          aria-label="Предыдущий вариант"
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Text c="white" size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
          {current} ({def?.name})
        </Text>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => go(1)}
          aria-label="Следующий вариант"
        >
          <IconChevronRight size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
